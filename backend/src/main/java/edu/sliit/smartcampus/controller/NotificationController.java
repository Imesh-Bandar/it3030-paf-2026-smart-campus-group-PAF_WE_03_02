package edu.sliit.smartcampus.controller;

import edu.sliit.smartcampus.dto.NotificationDto;
import edu.sliit.smartcampus.dto.NotificationPageResponse;
import edu.sliit.smartcampus.service.AuthService;
import edu.sliit.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationPageResponse> getNotifications(
            @RequestParam(required = false) Boolean read,
            @PageableDefault(size = 20, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        
        UUID userId = authService.getCurrentUserId();
        Page<NotificationDto> notifications;
        
        if (Boolean.FALSE.equals(read)) {
            notifications = notificationService.getUserNotifications(userId, true, pageable);
        } else {
            notifications = notificationService.getUserNotifications(userId, false, pageable);
        }
        
        long unreadCount = notificationService.getUnreadCount(userId);
        
        return ResponseEntity.ok(NotificationPageResponse.builder()
                .notifications(notifications)
                .unreadCount(unreadCount)
                .build());
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        UUID userId = authService.getCurrentUserId();
        int updatedCount = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of(
                "updatedCount", updatedCount,
                "message", "All notifications marked as read"
        ));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable java.util.UUID id) {
        UUID userId = authService.getCurrentUserId();
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }
}
