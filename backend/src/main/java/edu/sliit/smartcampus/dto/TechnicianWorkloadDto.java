package edu.sliit.smartcampus.dto;

import java.util.Map;
import java.util.UUID;

public record TechnicianWorkloadDto(
        UUID technicianId,
        String technicianName,
        long activeTickets,
        long overdueTickets,
        String loadStatus,
        Map<String, Long> priorityMix) {
}
