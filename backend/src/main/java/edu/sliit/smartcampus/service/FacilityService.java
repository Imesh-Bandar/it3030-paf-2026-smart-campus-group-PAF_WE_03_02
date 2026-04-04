package edu.sliit.smartcampus.service;

import edu.sliit.smartcampus.model.*;
import edu.sliit.smartcampus.repository.BookingRepository;
import edu.sliit.smartcampus.repository.ResourceRepository;
import edu.sliit.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Get all active facilities
     */
    public Page<Resource> getActiveFacilities(Pageable pageable) {
        return resourceRepository.findByDeletedAtIsNull(pageable);
    }

    /**
     * Get facilities filtered by type
     */
    public Page<Resource> getFacilitiesByType(String type, Pageable pageable) {
        return resourceRepository.findByTypeAndDeletedAtIsNull(type, pageable);
    }

    /**
     * Get facilities filtered by status
     */
    public Page<Resource> getFacilitiesByStatus(String status, Pageable pageable) {
        return resourceRepository.findByStatusAndDeletedAtIsNull(status, pageable);
    }

    /**
     * Search facilities by keyword
     */
    public Page<Resource> searchFacilities(String keyword, Pageable pageable) {
        return resourceRepository.searchByKeyword(keyword, pageable);
    }

    /**
     * Get count of active facilities for dashboard
     */
    public long getActiveFacilityCount() {
        return resourceRepository.countByDeletedAtIsNull();
    }

    /**
     * Create a new facility
     */
    @Transactional
    public void createFacility(String name, String type, int capacity, String location, String description) {
        // Create resource with status = AVAILABLE
        // (Resource entity creation would happen here)

        // Notify all users that a new facility is available
        List<User> users = userRepository.findAll();
        for (User user : users) {
            notificationService.createNotification(
                    user.getId(),
                    NotificationType.SYSTEM,
                    "New Facility Available",
                    "A new facility '" + name + "' has been added",
                    EntityType.RESOURCE,
                    UUID.randomUUID());
        }
    }

    /**
     * Update facility status and notify users if maintenance
     */
    @Transactional
    public void updateFacilityStatus(UUID resourceId, String newStatus) {
        // Fetch resource
        Resource resource = resourceRepository.findById(Objects.requireNonNull(resourceId, "resourceId"))
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        // If status changed to UNDER_MAINTENANCE, check for active bookings and notify
        // users
        if ("UNDER_MAINTENANCE".equals(newStatus)) {
            List<Booking> activeBookings = bookingRepository.findByResourceIdAndActiveStatus(resourceId);
            if (!activeBookings.isEmpty()) {
                // Notify booking owners about facility maintenance
                UUID bookingOwnerId = UUID.randomUUID(); // Would be extracted from booking
                notificationService.createNotification(
                        bookingOwnerId,
                        NotificationType.SYSTEM,
                        "Facility Under Maintenance: " + resource.getName(),
                        "The facility you booked is now under maintenance",
                        EntityType.RESOURCE,
                        resourceId);
            }
        }

        // Update status
        // (Would update the resource entity here)
    }

    /**
     * Soft delete a facility and notify affected users
     */
    @Transactional
    public void deleteFacility(UUID resourceId) {
        // Fetch resource
        Resource resource = resourceRepository.findById(Objects.requireNonNull(resourceId, "resourceId"))
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        // Check for active bookings
        List<Booking> activeBookings = bookingRepository.findByResourceIdAndActiveStatus(resourceId);
        if (!activeBookings.isEmpty()) {
            throw new RuntimeException("Cannot delete facility with active bookings");
        }

        // Soft delete
        // (Would set deletedAt timestamp here)

        // Create system notification about facility removal
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(
                    admin.getId(),
                    NotificationType.SYSTEM,
                    "Facility Deleted",
                    "The facility '" + resource.getName() + "' has been removed",
                    EntityType.RESOURCE,
                    resourceId);
        }
    }

    /**
     * Get facility availability for booking
     */
    public Object checkAvailability(UUID resourceId, String fromDate, String toDate) {
        // Fetch all bookings for resource in date range
        List<Booking> bookings = bookingRepository
                .findByResourceIdAndDateRange(Objects.requireNonNull(resourceId, "resourceId"), fromDate, toDate);
        // Build availability response
        return bookings;
    }
}
