package edu.sliit.smartcampus.dto;

import edu.sliit.smartcampus.model.TicketCategory;
import edu.sliit.smartcampus.model.TicketPriority;
import edu.sliit.smartcampus.model.TicketStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public record TicketResponse(
        UUID id,
        String ticketNumber,
        UUID resourceId,
        String resourceName,
        UUID reporterId,
        String title,
        String description,
        TicketPriority severity,
        TicketCategory category,
        TicketStatus status,
        UUID assignedTo,
        String location,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}