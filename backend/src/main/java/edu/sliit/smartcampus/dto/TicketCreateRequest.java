package edu.sliit.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import edu.sliit.smartcampus.model.TicketCategory;
import edu.sliit.smartcampus.model.TicketSeverity;

public record TicketCreateRequest(
        @NotNull UUID resourceId,
        @NotBlank String title,
        @NotBlank String description,
        @NotNull TicketSeverity severity,
        @NotNull TicketCategory category) {
}