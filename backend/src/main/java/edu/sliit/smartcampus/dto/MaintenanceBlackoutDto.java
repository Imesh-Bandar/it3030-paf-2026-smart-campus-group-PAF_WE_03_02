package edu.sliit.smartcampus.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MaintenanceBlackoutDto(
        UUID id,
        OffsetDateTime startDate,
        OffsetDateTime endDate,
        String reason,
        UUID createdById,
        String createdByName,
        OffsetDateTime createdAt) {
}
