package edu.sliit.smartcampus.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TechnicianAvailabilityDto(
        UUID technicianId,
        String technicianName,
        boolean available,
        String note,
        OffsetDateTime updatedAt) {
}
