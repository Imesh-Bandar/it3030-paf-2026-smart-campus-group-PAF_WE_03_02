package edu.sliit.smartcampus.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import edu.sliit.smartcampus.dto.BookingActionRequestDto;
import edu.sliit.smartcampus.dto.BookingAlternativeSlotDto;
import edu.sliit.smartcampus.dto.BookingCheckInRequestDto;
import edu.sliit.smartcampus.dto.BookingConflictPreviewDto;
import edu.sliit.smartcampus.dto.BookingDto;
import edu.sliit.smartcampus.dto.BookingRequestDto;
import edu.sliit.smartcampus.exception.ResourceNotFoundException;
import edu.sliit.smartcampus.exception.ValidationException;
import edu.sliit.smartcampus.model.Booking;
import edu.sliit.smartcampus.model.BookingStatus;
import edu.sliit.smartcampus.model.NotificationType;
import edu.sliit.smartcampus.model.Resource;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.model.WaitlistEntry;
import edu.sliit.smartcampus.model.WaitlistStatus;
import edu.sliit.smartcampus.repository.BookingRepository;
import edu.sliit.smartcampus.repository.ResourceRepository;
import edu.sliit.smartcampus.repository.UserRepository;
import edu.sliit.smartcampus.repository.WaitlistEntryRepository;

@Service
public class BookingService {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final WaitlistEntryRepository waitlistEntryRepository;
    private final NotificationService notificationService;

    public BookingService(
            AuthService authService,
            UserRepository userRepository,
            ResourceRepository resourceRepository,
            BookingRepository bookingRepository,
            WaitlistEntryRepository waitlistEntryRepository,
            NotificationService notificationService) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
        this.waitlistEntryRepository = waitlistEntryRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public BookingDto createBooking(BookingRequestDto request) {
        validateDateTime(request.bookingDate(), request.startTime(), request.endTime());
        String purpose = normalizePurpose(request.purpose());

        User currentUser = getCurrentUser();
        Resource resource = resourceRepository.findById(request.resourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setBooker(currentUser);
        booking.setBookingDate(request.bookingDate());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setPurpose(purpose);
        booking.setStatus(BookingStatus.PENDING);

        boolean conflictingApproved = !bookingRepository
                .findApprovedConflicts(resource.getId(), request.bookingDate(), request.startTime(), request.endTime())
                .isEmpty();

        Booking savedBooking = bookingRepository.save(booking);

        if (conflictingApproved) {
            int maxPosition = waitlistEntryRepository.findMaxPositionForSlot(
                    resource.getId(),
                    request.bookingDate(),
                    request.startTime(),
                    request.endTime());
            WaitlistEntry entry = new WaitlistEntry();
            entry.setBooking(savedBooking);
            entry.setUser(currentUser);
            entry.setPosition(maxPosition + 1);
            entry.setStatus(WaitlistStatus.WAITING);
            waitlistEntryRepository.save(entry);
        }

        notificationService.createNotification(
                currentUser.getId(),
                NotificationType.BOOKING_PENDING,
                "Booking request submitted",
                conflictingApproved
                        ? "Your request is in waitlist due to slot conflict."
                        : "Your booking request is pending admin approval.",
                savedBooking.getId(),
                "BOOKING");

        return toDto(savedBooking);
    }

    public List<BookingDto> getCurrentUserBookings() {
        User currentUser = getCurrentUser();
        return bookingRepository.findByBooker_IdOrderByBookingDateDescStartTimeDesc(currentUser.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<BookingDto> getPendingBookingsForAdmin() {
        return bookingRepository.findByStatusOrderByCreatedAtAsc(BookingStatus.PENDING)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public BookingDto getBooking(UUID bookingId) {
        Booking booking = getBookingOrThrow(bookingId);
        User currentUser = getCurrentUser();
        boolean canView = currentUser.getRole() == UserRole.ADMIN || currentUser.getRole() == UserRole.STAFF
                || booking.getBooker().getId().equals(currentUser.getId());
        if (!canView) {
            throw new IllegalArgumentException("Access denied");
        }
        return toDto(booking);
    }

    @Transactional
    public BookingDto approveBooking(UUID bookingId) {
        Booking booking = getBookingOrThrow(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ValidationException("Only pending bookings can be approved");
        }
        if (hasApprovedConflictExcluding(booking, booking.getId())) {
            throw new ValidationException("Cannot approve booking because the slot is already reserved");
        }

        User approver = getCurrentUser();
        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedBy(approver);
        booking.setApprovedAt(OffsetDateTime.now());
        booking.setRejectedReason(null);
        booking.setQrToken(UUID.randomUUID().toString());

        Booking saved = bookingRepository.save(booking);
        waitlistEntryRepository.findByBooking_Id(saved.getId()).ifPresent(waitlist -> {
            waitlist.setStatus(WaitlistStatus.ACCEPTED);
            waitlist.setPromotedAt(OffsetDateTime.now());
            waitlist.setPromotedToBooking(saved);
            waitlistEntryRepository.save(waitlist);
        });

        notificationService.createNotification(
                saved.getBooker().getId(),
                NotificationType.BOOKING_APPROVED,
                "Booking approved",
                "Your booking has been approved.",
                saved.getId(),
                "BOOKING");

        return toDto(saved);
    }

    @Transactional
    public BookingDto rejectBooking(UUID bookingId, BookingActionRequestDto request) {
        Booking booking = getBookingOrThrow(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ValidationException("Only pending bookings can be rejected");
        }

        String reason = request == null || request.reason() == null || request.reason().isBlank()
                ? "Booking request rejected by admin"
                : request.reason().trim();

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectedReason(reason);
        booking.setQrToken(null);
        Booking saved = bookingRepository.save(booking);

        waitlistEntryRepository.findByBooking_Id(saved.getId()).ifPresent(waitlist -> {
            waitlist.setStatus(WaitlistStatus.DECLINED);
            waitlistEntryRepository.save(waitlist);
        });

        notificationService.createNotification(
                saved.getBooker().getId(),
                NotificationType.BOOKING_REJECTED,
                "Booking rejected",
                reason,
                saved.getId(),
                "BOOKING");

        return toDto(saved);
    }

    @Transactional
    public BookingDto cancelBooking(UUID bookingId, BookingActionRequestDto request) {
        Booking booking = getBookingOrThrow(bookingId);
        if (!canCancelBooking(booking.getBooker().getId())) {
            throw new IllegalArgumentException("Access denied");
        }

        boolean wasApproved = booking.getStatus() == BookingStatus.APPROVED;

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REJECTED) {
            throw new ValidationException("Booking is already closed");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setRejectedReason(request != null ? request.reason() : booking.getRejectedReason());
        booking.setQrToken(null);
        Booking saved = bookingRepository.save(booking);

        waitlistEntryRepository.findByBooking_Id(saved.getId()).ifPresent(waitlist -> {
            waitlist.setStatus(WaitlistStatus.EXPIRED);
            waitlistEntryRepository.save(waitlist);
        });

        notificationService.createNotification(
                saved.getBooker().getId(),
                NotificationType.BOOKING_CANCELLED,
                "Booking cancelled",
                "Your booking was cancelled.",
                saved.getId(),
                "BOOKING");

        if (wasApproved) {
            autoPromoteWaitlist(saved);
        }

        return toDto(saved);
    }

    @Transactional
    public BookingDto verifyCheckIn(UUID bookingId, BookingCheckInRequestDto request) {
        Booking booking = getBookingOrThrow(bookingId);
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ValidationException("Only approved bookings can be checked in");
        }
        if (booking.getCheckedInAt() != null) {
            throw new ValidationException("Booking is already checked in");
        }
        if (booking.getQrToken() == null || !booking.getQrToken().equals(request.qrToken())) {
            throw new ValidationException("Invalid QR token");
        }

        User verifier = getCurrentUser();
        booking.setCheckedInAt(OffsetDateTime.now());
        booking.setCheckedInBy(verifier);
        booking.setStatus(BookingStatus.COMPLETED);
        Booking saved = bookingRepository.save(booking);

        return toDto(saved);
    }

    public List<BookingDto> getResourceBookings(UUID resourceId, LocalDate date) {
        if (date == null) {
            throw new ValidationException("Date is required");
        }
        return bookingRepository.findByResource_IdAndBookingDateOrderByStartTimeAsc(resourceId, date)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public BookingConflictPreviewDto previewConflict(BookingRequestDto request) {
        validateDateTime(request.bookingDate(), request.startTime(), request.endTime());

        Resource resource = resourceRepository.findById(request.resourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        List<Booking> approvedBookings = bookingRepository.findByResource_IdAndBookingDateAndStatusOrderByStartTimeAsc(
                resource.getId(),
                request.bookingDate(),
                BookingStatus.APPROVED);

        boolean hasConflict = approvedBookings.stream()
                .anyMatch(booking -> request.startTime().isBefore(booking.getEndTime())
                        && request.endTime().isAfter(booking.getStartTime()));

        if (!hasConflict) {
            return new BookingConflictPreviewDto(
                    false,
                    "Selected slot is currently available.",
                    List.of());
        }

        long durationMinutes = ChronoUnit.MINUTES.between(request.startTime(), request.endTime());
        List<BookingAlternativeSlotDto> alternatives = findAlternativeSlots(
                approvedBookings,
                durationMinutes,
                request.startTime());

        return new BookingConflictPreviewDto(
                true,
                alternatives.isEmpty()
                        ? "Selected slot conflicts with approved bookings. No alternatives found for this day."
                        : "Selected slot conflicts with approved bookings. Alternative slots are available.",
                alternatives);
    }

    public boolean canCancelBooking(UUID bookingOwnerId) {
        User currentUser = getCurrentUser();
        return currentUser.getRole() == UserRole.ADMIN || currentUser.getId().equals(bookingOwnerId);
    }

    private void validateDateTime(LocalDate bookingDate, LocalTime startTime, LocalTime endTime) {
        if (bookingDate == null || startTime == null || endTime == null) {
            throw new ValidationException("Booking date and time are required");
        }
        if (bookingDate.isBefore(LocalDate.now())) {
            throw new ValidationException("Booking date cannot be in the past");
        }
        if (!endTime.isAfter(startTime)) {
            throw new ValidationException("End time must be after start time");
        }
    }

    private String normalizePurpose(String purpose) {
        if (purpose == null || purpose.isBlank()) {
            throw new ValidationException("Purpose is required");
        }
        return purpose.trim();
    }

    private Booking getBookingOrThrow(UUID bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    private void autoPromoteWaitlist(Booking cancelledBooking) {
        if (cancelledBooking.getStatus() != BookingStatus.CANCELLED) {
            return;
        }

        List<WaitlistEntry> waitingEntries = waitlistEntryRepository.findBySlotAndStatusOrdered(
                cancelledBooking.getResource().getId(),
                cancelledBooking.getBookingDate(),
                cancelledBooking.getStartTime(),
                cancelledBooking.getEndTime(),
                WaitlistStatus.WAITING);

        if (waitingEntries.isEmpty()) {
            return;
        }

        WaitlistEntry next = waitingEntries.get(0);
        Booking promoted = next.getBooking();
        promoted.setStatus(BookingStatus.APPROVED);
        promoted.setApprovedBy(getCurrentUser());
        promoted.setApprovedAt(OffsetDateTime.now());
        promoted.setQrToken(UUID.randomUUID().toString());
        promoted.setRejectedReason(null);
        bookingRepository.save(promoted);

        next.setStatus(WaitlistStatus.ACCEPTED);
        next.setPromotedAt(OffsetDateTime.now());
        next.setPromotedToBooking(promoted);
        waitlistEntryRepository.save(next);

        notificationService.createNotification(
                promoted.getBooker().getId(),
                NotificationType.BOOKING_APPROVED,
                "Waitlist promotion successful",
                "Your waitlisted booking has been auto-approved due to a cancellation.",
                promoted.getId(),
                "BOOKING");
    }

    private BookingDto toDto(Booking booking) {
        WaitlistEntry waitlistEntry = waitlistEntryRepository.findByBooking_Id(booking.getId()).orElse(null);
        Integer waitlistPosition = waitlistEntry == null ? null : waitlistEntry.getPosition();
        boolean waitlisted = waitlistEntry != null && waitlistEntry.getStatus() == WaitlistStatus.WAITING;

        return new BookingDto(
                booking.getId(),
                booking.getResource().getId(),
                booking.getResource().getName(),
                booking.getBooker().getId(),
                booking.getBooker().getFullName(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getStatus().name(),
                booking.getRejectedReason(),
                booking.getQrToken(),
                booking.getApprovedAt(),
                booking.getCheckedInAt(),
                booking.getCheckedInBy() == null ? null : booking.getCheckedInBy().getId(),
                waitlisted,
                waitlistPosition,
                booking.getCreatedAt(),
                booking.getUpdatedAt());
    }

    private boolean hasApprovedConflictExcluding(Booking booking, UUID bookingId) {
        return !bookingRepository.findApprovedConflictsExcludingBooking(
                booking.getResource().getId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                bookingId).isEmpty();
    }

    private List<BookingAlternativeSlotDto> findAlternativeSlots(
            List<Booking> approvedBookings,
            long durationMinutes,
            LocalTime requestedStartTime) {
        LocalTime dayStart = LocalTime.of(8, 0);
        LocalTime dayEnd = LocalTime.of(22, 0);
        List<BookingAlternativeSlotDto> alternatives = new ArrayList<>();

        LocalTime candidateStart = dayStart;
        while (!candidateStart.plusMinutes(durationMinutes).isAfter(dayEnd) && alternatives.size() < 5) {
            LocalTime slotStart = candidateStart;
            LocalTime candidateEnd = slotStart.plusMinutes(durationMinutes);
            boolean overlaps = approvedBookings.stream()
                    .anyMatch(booking -> slotStart.isBefore(booking.getEndTime())
                            && candidateEnd.isAfter(booking.getStartTime()));

            if (!overlaps && !slotStart.equals(requestedStartTime)) {
                alternatives.add(new BookingAlternativeSlotDto(slotStart, candidateEnd));
            }

            candidateStart = candidateStart.plusMinutes(30);
        }

        return alternatives;
    }

    private User getCurrentUser() {
        UUID currentUserId = authService.getCurrentUserId();
        return userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }
}
