package edu.sliit.smartcampus.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import edu.sliit.smartcampus.model.TicketCategory;
import edu.sliit.smartcampus.model.TicketSeverity;
import edu.sliit.smartcampus.model.TicketStatus;

public record TicketSummaryDto(
        UUID id,
        String ticketNumber,
        UUID resourceId,
        String resourceName,
        UUID reporterId,
        String reporterName,
        UUID assignedToId,
        String assignedToName,
        UUID assignedById,
        String assignedByName,
        String title,
        String description,
        TicketSeverity severity,
        TicketCategory category,
        TicketStatus status,
        OffsetDateTime assignedAt,
        OffsetDateTime resolvedAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        long commentCount,
        long evidenceCount) {
}