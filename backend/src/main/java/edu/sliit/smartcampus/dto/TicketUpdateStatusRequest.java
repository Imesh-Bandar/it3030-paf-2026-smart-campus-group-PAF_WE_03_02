package edu.sliit.smartcampus.dto;

import jakarta.validation.constraints.NotNull;
import edu.sliit.smartcampus.model.TicketStatus;

public record TicketUpdateStatusRequest(
        @NotNull TicketStatus status,
        String notes) {
}