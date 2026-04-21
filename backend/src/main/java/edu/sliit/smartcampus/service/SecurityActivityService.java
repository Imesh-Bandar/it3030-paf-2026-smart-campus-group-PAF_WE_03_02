package edu.sliit.smartcampus.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import edu.sliit.smartcampus.dto.SecurityActivityLogDto;
import edu.sliit.smartcampus.model.NotificationType;
import edu.sliit.smartcampus.model.SecurityActivityLog;
import edu.sliit.smartcampus.model.SecurityEventType;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.repository.SecurityActivityLogRepository;
import edu.sliit.smartcampus.repository.UserRepository;

/**
 * D4-B25, D4-B26: Security activity logging and suspicious login detection.
 */
@Service
public class SecurityActivityService {

    private final SecurityActivityLogRepository logRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public SecurityActivityService(
            SecurityActivityLogRepository logRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.logRepository = logRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public void logEvent(UUID userId, SecurityEventType eventType, String ipAddress,
            String userAgent, String location, String details) {
        User user = userRepository.findById(userId).orElse(null);

        SecurityActivityLog log = new SecurityActivityLog();
        log.setUser(user);
        log.setEventType(eventType);
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        log.setLocation(location);
        log.setDetails(details);

        // D4-B26: Basic suspicious login detection
        boolean suspicious = detectSuspicious(userId, eventType, ipAddress);
        log.setSuspicious(suspicious);

        logRepository.save(log);

        // Trigger alert notification if suspicious
        if (suspicious && user != null) {
            try {
                notificationService.createNotification(
                        userId,
                        NotificationType.ACCOUNT_SECURITY_ALERT,
                        "Suspicious Login Detected",
                        "A login from an unusual location or device was detected at " +
                                OffsetDateTime.now() + ". If this wasn't you, please change your password.",
                        null,
                        "SECURITY");
            } catch (Exception ignored) {
                // Don't fail the login if notification fails
            }
        }
    }

    public Page<SecurityActivityLogDto> getActivityForCurrentUser(Pageable pageable) {
        UUID userId = getCurrentUserId();
        return logRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toDto);
    }

    public List<SecurityActivityLogDto> getSuspiciousActivityForCurrentUser() {
        UUID userId = getCurrentUserId();
        return logRepository.findByUser_IdAndSuspiciousTrue(userId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public int acknowledgeSuspiciousForCurrentUser() {
        UUID userId = getCurrentUserId();
        return logRepository.acknowledgeSuspiciousByUserId(userId, OffsetDateTime.now());
    }

    // D4-B26: Heuristic — flag if there are multiple failed logins recently
    private boolean detectSuspicious(UUID userId, SecurityEventType eventType, String ipAddress) {
        if (eventType == SecurityEventType.LOGIN_SUCCESS) {
            long failedCount = logRepository.countByUser_IdAndEventType(userId, SecurityEventType.LOGIN_FAILED);
            return failedCount >= 3; // Suspicious if 3+ prior failures
        }
        return false;
    }

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Unauthenticated request");
        }
        return UUID.fromString(authentication.getName());
    }

    private SecurityActivityLogDto toDto(SecurityActivityLog log) {
        return new SecurityActivityLogDto(
                log.getId(),
                log.getEventType().name(),
                log.getIpAddress(),
                log.getUserAgent(),
                log.getLocation(),
                log.isSuspicious(),
            log.getAcknowledgedAt(),
                log.getDetails(),
                log.getCreatedAt());
    }
}
