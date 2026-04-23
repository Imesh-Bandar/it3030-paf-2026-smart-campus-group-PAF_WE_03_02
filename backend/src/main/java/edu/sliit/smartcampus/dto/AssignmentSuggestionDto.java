package edu.sliit.smartcampus.dto;

import java.util.List;
import java.util.UUID;

public record AssignmentSuggestionDto(
        UUID ticketId,
        UUID suggestedTechnicianId,
        String suggestedTechnicianName,
        String reason,
        List<TechnicianWorkloadDto> workloads) {
}
