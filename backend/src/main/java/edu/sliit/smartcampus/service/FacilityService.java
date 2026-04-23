package edu.sliit.smartcampus.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import edu.sliit.smartcampus.dto.AvailabilityDayDto;
import edu.sliit.smartcampus.dto.AvailabilitySlotDto;
import edu.sliit.smartcampus.dto.AvailabilityWindowDto;
import edu.sliit.smartcampus.dto.AvailabilityWindowRequestDto;
import edu.sliit.smartcampus.dto.MaintenanceBlackoutDto;
import edu.sliit.smartcampus.dto.MaintenanceBlackoutRequestDto;
import edu.sliit.smartcampus.dto.ResourceAvailabilityDto;
import edu.sliit.smartcampus.dto.ResourceDto;
import edu.sliit.smartcampus.dto.ResourceRequestDto;
import edu.sliit.smartcampus.exception.ConflictException;
import edu.sliit.smartcampus.exception.ResourceNotFoundException;
import edu.sliit.smartcampus.exception.ValidationException;
import edu.sliit.smartcampus.model.AvailabilityWindow;
import edu.sliit.smartcampus.model.Booking;
import edu.sliit.smartcampus.model.BookingStatus;
import edu.sliit.smartcampus.model.MaintenanceBlackout;
import edu.sliit.smartcampus.model.Resource;
import edu.sliit.smartcampus.model.ResourceStatus;
import edu.sliit.smartcampus.model.ResourceType;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.repository.AvailabilityWindowRepository;
import edu.sliit.smartcampus.repository.BookingRepository;
import edu.sliit.smartcampus.repository.MaintenanceBlackoutRepository;
import edu.sliit.smartcampus.repository.ResourceRepository;
import edu.sliit.smartcampus.repository.UserRepository;

@Service
public class FacilityService {

    private static final LocalTime DEFAULT_DAY_START = LocalTime.of(8, 0);
    private static final LocalTime DEFAULT_DAY_END = LocalTime.of(22, 0);
    private static final ZoneOffset DEFAULT_OFFSET = ZoneOffset.UTC;
    private static final List<BookingStatus> VISIBLE_BOOKING_STATUSES = List.of(BookingStatus.PENDING,
            BookingStatus.APPROVED);

    private final ResourceRepository resourceRepository;
    private final AvailabilityWindowRepository availabilityWindowRepository;
    private final MaintenanceBlackoutRepository maintenanceBlackoutRepository;
    private final BookingRepository bookingRepository;
    private final AuthService authService;
    private final UserRepository userRepository;

    public FacilityService(
            ResourceRepository resourceRepository,
            AvailabilityWindowRepository availabilityWindowRepository,
            MaintenanceBlackoutRepository maintenanceBlackoutRepository,
            BookingRepository bookingRepository,
            AuthService authService,
            UserRepository userRepository) {
        this.resourceRepository = resourceRepository;
        this.availabilityWindowRepository = availabilityWindowRepository;
        this.maintenanceBlackoutRepository = maintenanceBlackoutRepository;
        this.bookingRepository = bookingRepository;
        this.authService = authService;
        this.userRepository = userRepository;
    }

    public List<ResourceDto> listResources(
            String type,
            String status,
            Integer capacityMin,
            Integer capacityMax,
            String query) {
        if (capacityMin != null && capacityMax != null && capacityMin > capacityMax) {
            throw new ValidationException("Minimum capacity cannot be greater than maximum capacity");
        }

        return resourceRepository.searchResources(
                parseType(type),
                parseStatus(status),
                capacityMin,
                capacityMax,
                normalizeOptional(query))
                .stream()
                .map(this::toDto)
                .toList();
    }

    public ResourceDto getResource(UUID resourceId) {
        return toDto(getActiveResource(resourceId));
    }

    @Transactional
    public ResourceDto createResource(ResourceRequestDto request) {
        validateResourceRequest(request, null);
        Resource resource = new Resource();
        applyResourceRequest(resource, request);
        Resource saved = resourceRepository.save(resource);
        replaceAvailabilityWindows(saved, request.availabilityWindows());
        return toDto(saved);
    }

    @Transactional
    public ResourceDto updateResource(UUID resourceId, ResourceRequestDto request) {
        validateResourceRequest(request, resourceId);
        Resource resource = getActiveResource(resourceId);
        applyResourceRequest(resource, request);
        Resource saved = resourceRepository.save(resource);
        replaceAvailabilityWindows(saved, request.availabilityWindows());
        return toDto(saved);
    }

    @Transactional
    public void deleteResource(UUID resourceId) {
        Resource resource = getActiveResource(resourceId);
        if (bookingRepository.existsByResource_IdAndStatusIn(resourceId,
                List.of(BookingStatus.PENDING, BookingStatus.APPROVED))) {
            throw new ConflictException("Cannot delete facility with active bookings. Cancel all bookings first.");
        }
        resource.setDeletedAt(OffsetDateTime.now());
        resource.setStatus(ResourceStatus.OUT_OF_SERVICE);
        resourceRepository.save(resource);
    }

    public ResourceAvailabilityDto getAvailability(UUID resourceId, LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw new ValidationException("'from' and 'to' dates are required");
        }
        if (to.isBefore(from)) {
            throw new ValidationException("'to' date must be on or after 'from' date");
        }
        if (ChronoUnit.DAYS.between(from, to) > 90) {
            throw new ValidationException("'to' date must be within 90 days of 'from' date");
        }

        Resource resource = getActiveResource(resourceId);
        List<AvailabilityWindow> windows = availabilityWindowRepository
                .findByResource_IdOrderByDayOfWeekAscStartTimeAsc(resourceId);
        List<MaintenanceBlackout> blackouts = maintenanceBlackoutRepository.findOverlapping(
                resourceId,
                from.atStartOfDay().atOffset(DEFAULT_OFFSET),
                to.plusDays(1).atStartOfDay().atOffset(DEFAULT_OFFSET));
        List<Booking> bookings = bookingRepository
                .findByResource_IdAndBookingDateBetweenAndStatusInOrderByBookingDateAscStartTimeAsc(
                        resourceId,
                        from,
                        to,
                        VISIBLE_BOOKING_STATUSES);

        List<AvailabilityDayDto> days = new ArrayList<>();
        LocalDate current = from;
        while (!current.isAfter(to)) {
            days.add(new AvailabilityDayDto(current, buildDaySlots(current, windows, blackouts, bookings)));
            current = current.plusDays(1);
        }

        return new ResourceAvailabilityDto(resource.getId(), resource.getName(), from, to, days);
    }

    public List<MaintenanceBlackoutDto> getMaintenanceBlackouts(UUID resourceId) {
        getActiveResource(resourceId);
        return maintenanceBlackoutRepository.findByResource_IdOrderByStartDateAsc(resourceId)
                .stream()
                .map(this::toBlackoutDto)
                .toList();
    }

    @Transactional
    public MaintenanceBlackoutDto createMaintenanceBlackout(UUID resourceId, MaintenanceBlackoutRequestDto request) {
        Resource resource = getActiveResource(resourceId);
        validateBlackout(request.startDate(), request.endDate());

        if (!maintenanceBlackoutRepository.findOverlapping(resourceId, request.startDate(), request.endDate())
                .isEmpty()) {
            throw new ConflictException("A maintenance blackout already exists for the selected period");
        }

        MaintenanceBlackout blackout = new MaintenanceBlackout();
        blackout.setResource(resource);
        blackout.setStartDate(request.startDate());
        blackout.setEndDate(request.endDate());
        blackout.setReason(request.reason().trim());
        blackout.setCreatedBy(getCurrentUser());

        return toBlackoutDto(maintenanceBlackoutRepository.save(blackout));
    }

    public void assertSlotBookable(UUID resourceId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        Resource resource = getActiveResource(resourceId);
        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new ValidationException("Resource is currently unavailable for booking");
        }

        List<AvailabilityWindow> windows = availabilityWindowRepository
                .findByResource_IdOrderByDayOfWeekAscStartTimeAsc(resourceId);
        int dayOfWeek = toSchemaDayOfWeek(date.getDayOfWeek());
        boolean insideWindow = windows.stream()
                .filter(window -> window.getDayOfWeek() == dayOfWeek)
                .anyMatch(
                        window -> !startTime.isBefore(window.getStartTime()) && !endTime.isAfter(window.getEndTime()));
        if (!insideWindow) {
            throw new ValidationException("Selected slot is outside the configured availability window");
        }

        OffsetDateTime slotStart = date.atTime(startTime).atOffset(DEFAULT_OFFSET);
        OffsetDateTime slotEnd = date.atTime(endTime).atOffset(DEFAULT_OFFSET);
        if (!maintenanceBlackoutRepository.findOverlapping(resourceId, slotStart, slotEnd).isEmpty()) {
            throw new ValidationException("Selected slot is blocked by maintenance");
        }
    }

    private List<AvailabilitySlotDto> buildDaySlots(
            LocalDate date,
            List<AvailabilityWindow> windows,
            List<MaintenanceBlackout> blackouts,
            List<Booking> bookings) {
        int dayOfWeek = toSchemaDayOfWeek(date.getDayOfWeek());
        List<AvailabilityWindow> dayWindows = windows.stream()
                .filter(window -> window.getDayOfWeek() == dayOfWeek)
                .sorted(Comparator.comparing(AvailabilityWindow::getStartTime))
                .toList();

        if (dayWindows.isEmpty()) {
            return List.of(new AvailabilitySlotDto(
                    DEFAULT_DAY_START,
                    DEFAULT_DAY_END,
                    "UNAVAILABLE",
                    null,
                    null,
                    "No operating hours configured"));
        }

        List<MaintenanceBlackout> dayBlackouts = blackouts.stream().filter(blackout -> overlapsDate(blackout, date))
                .toList();
        List<Booking> dayBookings = bookings.stream().filter(booking -> date.equals(booking.getBookingDate())).toList();

        List<AvailabilitySlotDto> result = new ArrayList<>();
        for (AvailabilityWindow window : dayWindows) {
            LinkedHashSet<LocalTime> points = new LinkedHashSet<>();
            points.add(window.getStartTime());
            points.add(window.getEndTime());

            for (Booking booking : dayBookings) {
                if (booking.getStartTime() != null && booking.getEndTime() != null
                        && booking.getStartTime().isBefore(window.getEndTime())
                        && booking.getEndTime().isAfter(window.getStartTime())) {
                    points.add(maxTime(window.getStartTime(), booking.getStartTime()));
                    points.add(minTime(window.getEndTime(), booking.getEndTime()));
                }
            }

            for (MaintenanceBlackout blackout : dayBlackouts) {
                LocalTime blackoutStart = toLocalTimeForDate(blackout.getStartDate(), date, DEFAULT_DAY_START);
                LocalTime blackoutEnd = toLocalTimeForDate(blackout.getEndDate(), date, DEFAULT_DAY_END);
                if (blackoutStart.isBefore(window.getEndTime()) && blackoutEnd.isAfter(window.getStartTime())) {
                    points.add(maxTime(window.getStartTime(), blackoutStart));
                    points.add(minTime(window.getEndTime(), blackoutEnd));
                }
            }

            List<LocalTime> sortedPoints = points.stream().sorted().toList();
            for (int index = 0; index < sortedPoints.size() - 1; index++) {
                LocalTime start = sortedPoints.get(index);
                LocalTime end = sortedPoints.get(index + 1);
                if (!end.isAfter(start)) {
                    continue;
                }

                MaintenanceBlackout blackout = dayBlackouts.stream()
                        .filter(item -> overlaps(
                                start,
                                end,
                                toLocalTimeForDate(item.getStartDate(), date, DEFAULT_DAY_START),
                                toLocalTimeForDate(item.getEndDate(), date, DEFAULT_DAY_END)))
                        .findFirst()
                        .orElse(null);
                if (blackout != null) {
                    result.add(new AvailabilitySlotDto(start, end, "BLOCKED", null, null, blackout.getReason()));
                    continue;
                }

                Booking booking = dayBookings.stream()
                        .filter(item -> item.getStartTime() != null && item.getEndTime() != null
                                && overlaps(start, end, item.getStartTime(), item.getEndTime()))
                        .findFirst()
                        .orElse(null);
                if (booking != null) {
                    result.add(new AvailabilitySlotDto(
                            start,
                            end,
                            "OCCUPIED",
                            booking.getId(),
                            booking.getBooker() == null ? null : booking.getBooker().getFullName(),
                            null));
                    continue;
                }

                result.add(new AvailabilitySlotDto(start, end, "AVAILABLE", null, null, null));
            }
        }

        return result;
    }

    private void validateResourceRequest(ResourceRequestDto request, UUID resourceId) {
        if (request.availabilityWindows() == null || request.availabilityWindows().isEmpty()) {
            throw new ValidationException("At least one availability window is required");
        }

        if (resourceId == null) {
            if (resourceRepository.existsByNameIgnoreCaseAndDeletedAtIsNull(request.name().trim())) {
                throw new ConflictException("A resource with this name already exists");
            }
            if (resourceRepository.existsByResourceCodeIgnoreCaseAndDeletedAtIsNull(request.resourceCode().trim())) {
                throw new ConflictException("A resource with this code already exists");
            }
        } else {
            if (resourceRepository.existsByNameIgnoreCaseAndIdNotAndDeletedAtIsNull(request.name().trim(),
                    resourceId)) {
                throw new ConflictException("A resource with this name already exists");
            }
            if (resourceRepository.existsByResourceCodeIgnoreCaseAndIdNotAndDeletedAtIsNull(
                    request.resourceCode().trim(), resourceId)) {
                throw new ConflictException("A resource with this code already exists");
            }
        }

        for (AvailabilityWindowRequestDto window : request.availabilityWindows()) {
            if (!window.endTime().isAfter(window.startTime())) {
                throw new ValidationException("Availability window end time must be after start time");
            }
        }
    }

    private void applyResourceRequest(Resource resource, ResourceRequestDto request) {
        resource.setResourceCode(request.resourceCode().trim().toUpperCase());
        resource.setName(request.name().trim());
        resource.setType(parseRequiredType(request.type()));
        resource.setStatus(request.status() == null || request.status().isBlank()
                ? ResourceStatus.ACTIVE
                : parseRequiredStatus(request.status()));
        resource.setLocation(request.location().trim());
        resource.setCapacity(request.capacity());
        resource.setDescription(request.description() == null ? null : request.description().trim());
        resource.setThumbnailUrl(request.thumbnailUrl() == null ? null : request.thumbnailUrl().trim());
        resource.setAmenities(request.amenities() == null ? new ArrayList<>() : new ArrayList<>(request.amenities()));
        resource.setSpecifications(request.specifications() == null ? Map.of() : Map.copyOf(request.specifications()));
    }

    private void replaceAvailabilityWindows(Resource resource, List<AvailabilityWindowRequestDto> windows) {
        availabilityWindowRepository.deleteByResource_Id(resource.getId());
        List<AvailabilityWindow> entities = windows.stream().map(window -> {
            AvailabilityWindow entity = new AvailabilityWindow();
            entity.setResource(resource);
            entity.setDayOfWeek(window.dayOfWeek());
            entity.setStartTime(window.startTime());
            entity.setEndTime(window.endTime());
            return entity;
        }).toList();
        availabilityWindowRepository.saveAll(entities);
    }

    private void validateBlackout(OffsetDateTime startDate, OffsetDateTime endDate) {
        if (startDate == null || endDate == null) {
            throw new ValidationException("Blackout start and end dates are required");
        }
        if (!endDate.isAfter(startDate)) {
            throw new ValidationException("Blackout end date must be after start date");
        }
    }

    private Resource getActiveResource(UUID resourceId) {
        return resourceRepository.findActiveById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
    }

    private User getCurrentUser() {
        return userRepository.findById(authService.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private ResourceDto toDto(Resource resource) {
        List<AvailabilityWindowDto> windows = availabilityWindowRepository
                .findByResource_IdOrderByDayOfWeekAscStartTimeAsc(resource.getId())
                .stream()
                .map(window -> new AvailabilityWindowDto(
                        window.getId(),
                        window.getDayOfWeek(),
                        window.getStartTime(),
                        window.getEndTime()))
                .toList();

        return new ResourceDto(
                resource.getId(),
                resource.getResourceCode(),
                resource.getName(),
                resource.getType().name(),
                resource.getStatus().name(),
                resource.getLocation(),
                resource.getCapacity(),
                resource.getDescription(),
                resource.getThumbnailUrl(),
                List.copyOf(resource.getAmenities()),
                Map.copyOf(resource.getSpecifications()),
                windows,
                resource.getCreatedAt(),
                resource.getUpdatedAt());
    }

    private MaintenanceBlackoutDto toBlackoutDto(MaintenanceBlackout blackout) {
        return new MaintenanceBlackoutDto(
                blackout.getId(),
                blackout.getStartDate(),
                blackout.getEndDate(),
                blackout.getReason(),
                blackout.getCreatedBy().getId(),
                blackout.getCreatedBy().getFullName(),
                blackout.getCreatedAt());
    }

    private ResourceType parseType(String type) {
        if (type == null || type.isBlank()) {
            return null;
        }
        return parseRequiredType(type);
    }

    private ResourceStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        return parseRequiredStatus(status);
    }

    private ResourceType parseRequiredType(String type) {
        try {
            return ResourceType.valueOf(type.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ValidationException("Invalid resource type");
        }
    }

    private ResourceStatus parseRequiredStatus(String status) {
        try {
            return ResourceStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ValidationException("Invalid resource status");
        }
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim().toLowerCase(Locale.ROOT);
    }

    private int toSchemaDayOfWeek(DayOfWeek dayOfWeek) {
        return dayOfWeek.getValue() % 7;
    }

    private boolean overlapsDate(MaintenanceBlackout blackout, LocalDate date) {
        LocalDate start = blackout.getStartDate().toLocalDate();
        LocalDate end = blackout.getEndDate().minusNanos(1).toLocalDate();
        return !date.isBefore(start) && !date.isAfter(end);
    }

    private LocalTime toLocalTimeForDate(OffsetDateTime value, LocalDate date, LocalTime fallback) {
        return value.toLocalDate().equals(date) ? value.toLocalTime() : fallback;
    }

    private boolean overlaps(LocalTime firstStart, LocalTime firstEnd, LocalTime secondStart, LocalTime secondEnd) {
        return firstStart.isBefore(secondEnd) && firstEnd.isAfter(secondStart);
    }

    private LocalTime minTime(LocalTime left, LocalTime right) {
        return left.isBefore(right) ? left : right;
    }

    private LocalTime maxTime(LocalTime left, LocalTime right) {
        return left.isAfter(right) ? left : right;
    }
}
