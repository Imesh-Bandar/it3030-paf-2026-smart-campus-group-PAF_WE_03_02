package edu.sliit.smartcampus.dto;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record TechnicianWorkloadDto(
        UUID technicianId,
        String technicianName,
        boolean available,
        String availabilityNote,
        OffsetDateTime availabilityUpdatedAt,
        long activeTickets,
        long overdueTickets,
        String loadStatus,
        Map<String, Long> priorityMix) {
}
