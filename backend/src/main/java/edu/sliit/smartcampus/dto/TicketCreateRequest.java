package edu.sliit.smartcampus.dto;

import edu.sliit.smartcampus.model.TicketCategory;
import edu.sliit.smartcampus.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record TicketCreateRequest(
        @NotNull(message = "Resource ID is required") UUID resourceId,

        @NotBlank(message = "Title is required") @Size(min = 5, max = 100, message = "Title must be between 5 and 100 characters") String title,

        @NotBlank(message = "Description is required") @Size(min = 20, max = 1000, message = "Description must be between 20 and 1000 characters") String description,

        @NotNull(message = "Severity is required") TicketPriority severity,

        @NotNull(message = "Category is required") TicketCategory category,

        @Size(max = 255, message = "Location must not exceed 255 characters") String location) {
}