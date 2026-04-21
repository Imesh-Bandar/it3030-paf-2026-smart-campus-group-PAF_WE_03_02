package edu.sliit.smartcampus.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificationDto(
        UUID id,
        String type,
        String title,
        String message,
        UUID referenceId,
        String referenceType,
        boolean read,
        OffsetDateTime createdAt,
        OffsetDateTime readAt) {
}
