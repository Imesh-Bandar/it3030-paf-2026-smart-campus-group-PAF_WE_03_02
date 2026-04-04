package edu.sliit.smartcampus.dto;

import edu.sliit.smartcampus.model.EntityType;
import edu.sliit.smartcampus.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private UUID id;
    private UUID userId;
    private NotificationType type;
    private String title;
    private String message;
    private EntityType entityType;
    private UUID entityId;
    private boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
