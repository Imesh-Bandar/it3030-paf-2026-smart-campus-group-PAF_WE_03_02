package edu.sliit.smartcampus.dto;

import java.time.OffsetDateTime;
import java.util.UUID;
import edu.sliit.smartcampus.model.TicketStatus;

public record TicketStatusHistoryDto(
        UUID id,
        TicketStatus oldStatus,
        TicketStatus newStatus,
        UUID changedById,
        String changedByName,
        String notes,
        OffsetDateTime createdAt) {
}