package edu.sliit.smartcampus.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import edu.sliit.smartcampus.dto.BookingRequestDto;
import edu.sliit.smartcampus.model.Booking;
import edu.sliit.smartcampus.model.BookingStatus;
import edu.sliit.smartcampus.model.Resource;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.model.WaitlistEntry;
import edu.sliit.smartcampus.repository.BookingRepository;
import edu.sliit.smartcampus.repository.ResourceRepository;
import edu.sliit.smartcampus.repository.UserRepository;
import edu.sliit.smartcampus.repository.WaitlistEntryRepository;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private WaitlistEntryRepository waitlistEntryRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BookingService bookingService;

    private User booker;
    private User admin;
    private Resource resource;

    @BeforeEach
    void setUp() {
        booker = new User();
        booker.setId(UUID.randomUUID());
        booker.setFullName("Student Booker");
        booker.setRole(UserRole.STUDENT);

        admin = new User();
        admin.setId(UUID.randomUUID());
        admin.setFullName("Admin User");
        admin.setRole(UserRole.ADMIN);

        resource = new Resource();
        resource.setId(UUID.randomUUID());
        resource.setName("Main Hall");
    }

    @Test
    void createBooking_withConflict_createsWaitlistEntry() {
        BookingRequestDto request = new BookingRequestDto(
                resource.getId(),
                LocalDate.now().plusDays(1),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0),
                "Lecture");

        when(authService.getCurrentUserId()).thenReturn(booker.getId());
        when(userRepository.findById(booker.getId())).thenReturn(Optional.of(booker));
        when(resourceRepository.findById(resource.getId())).thenReturn(Optional.of(resource));

        Booking conflictingApproved = buildApprovedBooking(LocalTime.of(10, 30), LocalTime.of(11, 30));
        when(bookingRepository.findApprovedConflicts(
                eq(resource.getId()),
                eq(request.bookingDate()),
                eq(request.startTime()),
                eq(request.endTime()))).thenReturn(List.of(conflictingApproved));

        Booking savedBooking = new Booking();
        savedBooking.setId(UUID.randomUUID());
        savedBooking.setResource(resource);
        savedBooking.setBooker(booker);
        savedBooking.setBookingDate(request.bookingDate());
        savedBooking.setStartTime(request.startTime());
        savedBooking.setEndTime(request.endTime());
        savedBooking.setStatus(BookingStatus.PENDING);
        savedBooking.setCreatedAt(OffsetDateTime.now());
        savedBooking.setUpdatedAt(OffsetDateTime.now());

        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);
        when(waitlistEntryRepository.findMaxPositionForSlot(
                resource.getId(), request.bookingDate(), request.startTime(), request.endTime())).thenReturn(2);

        bookingService.createBooking(request);

        ArgumentCaptor<WaitlistEntry> waitlistCaptor = ArgumentCaptor.forClass(WaitlistEntry.class);
        verify(waitlistEntryRepository).save(waitlistCaptor.capture());
        assertThat(waitlistCaptor.getValue().getPosition()).isEqualTo(3);
    }

    @Test
    void createBooking_withoutConflict_doesNotCreateWaitlistEntry() {
        BookingRequestDto request = new BookingRequestDto(
                resource.getId(),
                LocalDate.now().plusDays(1),
                LocalTime.of(8, 0),
                LocalTime.of(9, 0),
                "Workshop");

        when(authService.getCurrentUserId()).thenReturn(booker.getId());
        when(userRepository.findById(booker.getId())).thenReturn(Optional.of(booker));
        when(resourceRepository.findById(resource.getId())).thenReturn(Optional.of(resource));
        when(bookingRepository.findApprovedConflicts(
                resource.getId(), request.bookingDate(), request.startTime(), request.endTime())).thenReturn(List.of());

        Booking savedBooking = new Booking();
        savedBooking.setId(UUID.randomUUID());
        savedBooking.setResource(resource);
        savedBooking.setBooker(booker);
        savedBooking.setBookingDate(request.bookingDate());
        savedBooking.setStartTime(request.startTime());
        savedBooking.setEndTime(request.endTime());
        savedBooking.setStatus(BookingStatus.PENDING);
        savedBooking.setCreatedAt(OffsetDateTime.now());
        savedBooking.setUpdatedAt(OffsetDateTime.now());

        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        var response = bookingService.createBooking(request);

        assertThat(response.waitlisted()).isFalse();
    }

    @Test
    void approveBooking_setsApprovedStateAndQrToken() {
        Booking pending = new Booking();
        pending.setId(UUID.randomUUID());
        pending.setStatus(BookingStatus.PENDING);
        pending.setBooker(booker);
        pending.setResource(resource);
        pending.setBookingDate(LocalDate.now().plusDays(1));
        pending.setStartTime(LocalTime.of(9, 0));
        pending.setEndTime(LocalTime.of(10, 0));
        pending.setCreatedAt(OffsetDateTime.now());
        pending.setUpdatedAt(OffsetDateTime.now());

        when(authService.getCurrentUserId()).thenReturn(admin.getId());
        when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));
        when(bookingRepository.findById(pending.getId())).thenReturn(Optional.of(pending));
        when(bookingRepository.findApprovedConflictsExcludingBooking(
                resource.getId(),
                pending.getBookingDate(),
                pending.getStartTime(),
                pending.getEndTime(),
                pending.getId())).thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(waitlistEntryRepository.findByBooking_Id(pending.getId())).thenReturn(Optional.empty());
        when(waitlistEntryRepository.findByBooking_Id(any(UUID.class))).thenReturn(Optional.empty());

        var dto = bookingService.approveBooking(pending.getId());

        assertThat(dto.status()).isEqualTo("APPROVED");
        assertThat(dto.qrToken()).isNotBlank();
    }

    @Test
    void previewConflict_whenOverlap_returnsAlternatives() {
        BookingRequestDto request = new BookingRequestDto(
                resource.getId(),
                LocalDate.now().plusDays(2),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0),
                "Seminar");

        when(resourceRepository.findById(resource.getId())).thenReturn(Optional.of(resource));

        Booking approved = buildApprovedBooking(LocalTime.of(10, 0), LocalTime.of(11, 30));
        when(bookingRepository.findByResource_IdAndBookingDateAndStatusOrderByStartTimeAsc(
                resource.getId(),
                request.bookingDate(),
                BookingStatus.APPROVED)).thenReturn(List.of(approved));

        var preview = bookingService.previewConflict(request);

        assertThat(preview.conflictDetected()).isTrue();
        assertThat(preview.alternatives()).isNotEmpty();
    }

    @Test
    void approveBooking_whenApprovedConflictExists_throwsValidationException() {
        Booking pending = new Booking();
        pending.setId(UUID.randomUUID());
        pending.setStatus(BookingStatus.PENDING);
        pending.setBooker(booker);
        pending.setResource(resource);
        pending.setBookingDate(LocalDate.now().plusDays(1));
        pending.setStartTime(LocalTime.of(9, 0));
        pending.setEndTime(LocalTime.of(10, 0));

        Booking conflictingApproved = buildApprovedBooking(LocalTime.of(9, 30), LocalTime.of(10, 30));

        when(bookingRepository.findById(pending.getId())).thenReturn(Optional.of(pending));
        when(bookingRepository.findApprovedConflictsExcludingBooking(
                resource.getId(),
                pending.getBookingDate(),
                pending.getStartTime(),
                pending.getEndTime(),
                pending.getId())).thenReturn(List.of(conflictingApproved));

        assertThatThrownBy(() -> bookingService.approveBooking(pending.getId()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("slot is already reserved");
    }

    @Test
    void createBooking_invalidTimeRange_throwsValidationException() {
        BookingRequestDto invalidRequest = new BookingRequestDto(
                resource.getId(),
                LocalDate.now().plusDays(1),
                LocalTime.of(12, 0),
                LocalTime.of(11, 0),
                "Invalid");

        assertThatThrownBy(() -> bookingService.createBooking(invalidRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("End time must be after start time");
    }

    private Booking buildApprovedBooking(LocalTime start, LocalTime end) {
        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setResource(resource);
        booking.setBooker(booker);
        booking.setBookingDate(LocalDate.now().plusDays(1));
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setStatus(BookingStatus.APPROVED);
        booking.setCreatedAt(OffsetDateTime.now());
        booking.setUpdatedAt(OffsetDateTime.now());
        return booking;
    }
}
