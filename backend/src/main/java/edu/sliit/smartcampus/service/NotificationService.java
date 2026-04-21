package edu.sliit.smartcampus.service;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import edu.sliit.smartcampus.dto.NotificationDto;
import edu.sliit.smartcampus.dto.NotificationPreferenceDto;
import edu.sliit.smartcampus.exception.ResourceNotFoundException;
import edu.sliit.smartcampus.model.Notification;
import edu.sliit.smartcampus.model.NotificationPreference;
import edu.sliit.smartcampus.model.NotificationType;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.repository.NotificationPreferenceRepository;
import edu.sliit.smartcampus.repository.NotificationRepository;
import edu.sliit.smartcampus.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            NotificationPreferenceRepository preferenceRepository,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
    }

    // ── D4-B04: Core notification methods ──────────────────────────────────────

    public Page<NotificationDto> getNotificationsForCurrentUser(Pageable pageable) {
        UUID userId = getCurrentUserId();
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDto);
    }

    @Transactional
    public NotificationDto markAsRead(UUID notificationId) {
        UUID userId = getCurrentUserId();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        notification.setRead(true);
        notification.setReadAt(OffsetDateTime.now());
        return toDto(notificationRepository.save(notification));
    }

    @Transactional
    public int markAllAsRead() {
        UUID userId = getCurrentUserId();
        return notificationRepository.markAllReadByUserId(userId, OffsetDateTime.now());
    }

    @Transactional
    public void deleteNotification(UUID notificationId) {
        UUID userId = getCurrentUserId();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        notificationRepository.delete(notification);
    }

    public long getUnreadCount() {
        UUID userId = getCurrentUserId();
        return notificationRepository.countByUser_IdAndReadFalse(userId);
    }

    // ── Notification creation (triggered by other services) ────────────────────

    @Transactional
    public void createNotification(UUID userId, NotificationType type, String title, String message,
            UUID referenceId, String referenceType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check preferences before sending
        NotificationPreference prefs = preferenceRepository.findByUser_Id(userId)
                .orElse(null);

        if (prefs != null && !isTypeAllowed(prefs, type)) {
            return; // User has disabled this notification category
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    // ── D4-B22/23: Notification preferences ───────────────────────────────────

    public NotificationPreferenceDto getPreferences() {
        UUID userId = getCurrentUserId();
        NotificationPreference prefs = getOrCreatePreferences(userId);
        return toPreferenceDto(prefs);
    }

    @Transactional
    public NotificationPreferenceDto updatePreferences(NotificationPreferenceDto dto) {
        UUID userId = getCurrentUserId();
        NotificationPreference prefs = getOrCreatePreferences(userId);

        prefs.setBookingNotifications(dto.bookingNotifications());
        prefs.setTicketNotifications(dto.ticketNotifications());
        prefs.setSecurityNotifications(dto.securityNotifications());
        prefs.setReminderNotifications(dto.reminderNotifications());
        prefs.setGeneralNotifications(dto.generalNotifications());

        return toPreferenceDto(preferenceRepository.save(prefs));
    }

    // ── Private helpers ─────────────────────────────────────────────────────────

    private NotificationPreference getOrCreatePreferences(UUID userId) {
        return preferenceRepository.findByUser_Id(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            NotificationPreference pref = new NotificationPreference();
            pref.setUser(user);
            return preferenceRepository.save(pref);
        });
    }

    private boolean isTypeAllowed(NotificationPreference prefs, NotificationType type) {
        return switch (type) {
            case BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED, BOOKING_PENDING -> prefs.isBookingNotifications();
            case TICKET_CREATED, TICKET_ASSIGNED, TICKET_STATUS_UPDATED, TICKET_RESOLVED, TICKET_COMMENT_ADDED -> prefs.isTicketNotifications();
            case ACCOUNT_SECURITY_ALERT -> prefs.isSecurityNotifications();
            case USER_ROLE_CHANGED -> prefs.isGeneralNotifications();
            case GENERAL -> prefs.isGeneralNotifications();
        };
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Unauthenticated request");
        }
        return UUID.fromString(authentication.getName());
    }

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getType().name(),
                n.getTitle(),
                n.getMessage(),
                n.getReferenceId(),
                n.getReferenceType(),
                n.isRead(),
                n.getCreatedAt(),
                n.getReadAt());
    }

    private NotificationPreferenceDto toPreferenceDto(NotificationPreference p) {
        return new NotificationPreferenceDto(
                p.isBookingNotifications(),
                p.isTicketNotifications(),
                p.isSecurityNotifications(),
                p.isReminderNotifications(),
                p.isGeneralNotifications());
    }
}
