package edu.sliit.smartcampus.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TicketAssignRequest(
        @NotNull UUID assignedToId,
        String notes) {
}