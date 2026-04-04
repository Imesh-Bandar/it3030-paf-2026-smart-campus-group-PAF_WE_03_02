package edu.sliit.smartcampus.service;

import edu.sliit.smartcampus.model.*;
import edu.sliit.smartcampus.repository.BookingRepository;
import edu.sliit.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    /**
     * Create a new booking request with conflict detection and notifications
     */
    @Transactional
    public void createBooking(UUID resourceId, UUID userId, LocalDateTime startTime, LocalDateTime endTime,
            String purpose) {
        // Conflict detection
        List<Booking> conflicts = bookingRepository.findConflictingBookings(resourceId, startTime, endTime);
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Resource is not available for this time slot");
        }

        // Create booking with PENDING status
        // (Booking entity creation would happen here)

        // Notify all ADMIN users about new pending booking
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(
                    admin.getId(),
                    NotificationType.BOOKING,
                    "New Booking Request",
                    "A new facility booking request requires your approval",
                    EntityType.BOOKING,
                    resourceId);
        }
    }

    /**
     * Approve a booking request and notify the requester
     */
    @Transactional
    public void approveBooking(UUID bookingId, UUID approverId) {
        // Fetch the booking and verify admin role
        User approver = getCurrentUser();
        if (approver.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Only admins can approve bookings");
        }

        // Re-check for conflicts before approving
        // Update booking status to CONFIRMED

        // Notify the booking requester
        UUID requesterId = UUID.randomUUID(); // Would be fetched from actual booking
        notificationService.createNotification(
                requesterId,
                NotificationType.BOOKING,
                "Booking Approved",
                "Your facility booking has been approved and confirmed",
                EntityType.BOOKING,
                bookingId);
    }

    /**
     * Reject a booking request with reason and notify requester
     */
    @Transactional
    public void rejectBooking(UUID bookingId, String reason, UUID rejectorId) {
        User rejector = getCurrentUser();
        if (rejector.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Only admins can reject bookings");
        }

        // Update booking status to REJECTED

        // Notify the requester with rejection reason
        UUID requesterId = UUID.randomUUID(); // Would be fetched from actual booking
        notificationService.createNotification(
                requesterId,
                NotificationType.BOOKING,
                "Booking Rejected",
                "Your booking request was rejected: " + reason,
                EntityType.BOOKING,
                bookingId);
    }

    /**
     * Cancel a booking and notify affected parties
     */
    @Transactional
    public void cancelBooking(UUID bookingId, String reason, UUID cancelerId) {
        User canceller = getCurrentUser();

        // Verify authorization
        boolean canCancel = canCancelBooking(bookingId, cancelerId);
        if (!canCancel) {
            throw new RuntimeException("Not authorized to cancel this booking");
        }

        // Update booking status to CANCELLED

        // If cancelled by admin, notify booking owner
        if (canceller.getRole() == UserRole.ADMIN) {
            UUID bookingOwnerId = UUID.randomUUID(); // Would be fetched from actual booking
            notificationService.createNotification(
                    bookingOwnerId,
                    NotificationType.BOOKING,
                    "Booking Cancelled",
                    "Your booking has been cancelled by admin: " + reason,
                    EntityType.BOOKING,
                    bookingId);
        }
    }

    /**
     * Get all pending bookings (admin dashboard)
     */
    public Page<Booking> getPendingBookings(Pageable pageable) {
        return bookingRepository.findByStatus("PENDING", pageable);
    }

    /**
     * Get all bookings for a specific user
     */
    public Page<Booking> getUserBookings(UUID userId, Pageable pageable) {
        return bookingRepository.findByUserId(userId, pageable);
    }

    /**
     * Get count of bookings by status for dashboard
     */
    public long getBookingCountByStatus(String status) {
        return bookingRepository.countByStatus(status);
    }

    /**
     * Check if user can cancel a booking
     */
    public boolean canCancelBooking(UUID bookingOwnerId, UUID currentUserId) {
        User currentUser = getCurrentUser();
        return currentUser.getRole() == UserRole.ADMIN || currentUser.getId().equals(bookingOwnerId);
    }

    private User getCurrentUser() {
        UUID currentUserId = Objects.requireNonNull(authService.getCurrentUserId(), "Authenticated user id not found");
        return userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }
}
