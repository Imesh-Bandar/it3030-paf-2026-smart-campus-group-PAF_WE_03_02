package edu.sliit.smartcampus.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record SecurityActivityLogDto(
        UUID id,
        String eventType,
        String ipAddress,
        String userAgent,
        String location,
        boolean suspicious,
        OffsetDateTime acknowledgedAt,
        String details,
        OffsetDateTime createdAt) {
}
