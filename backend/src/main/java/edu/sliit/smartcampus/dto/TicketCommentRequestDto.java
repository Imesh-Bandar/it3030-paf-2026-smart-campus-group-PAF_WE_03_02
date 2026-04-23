package edu.sliit.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TicketCommentRequestDto(
        @NotBlank @Size(max = 2000) String content,
        Boolean internal) {
}
