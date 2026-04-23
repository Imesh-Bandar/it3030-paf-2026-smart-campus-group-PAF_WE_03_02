package edu.sliit.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public record TicketStatusUpdateRequestDto(
        @NotBlank String status,
        String reason) {
}
