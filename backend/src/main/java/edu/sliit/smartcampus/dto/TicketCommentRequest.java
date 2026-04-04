package edu.sliit.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public record TicketCommentRequest(
        @NotBlank String text) {
}