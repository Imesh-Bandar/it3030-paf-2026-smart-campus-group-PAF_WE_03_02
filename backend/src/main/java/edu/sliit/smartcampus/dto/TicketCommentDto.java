package edu.sliit.smartcampus.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TicketCommentDto(
        UUID id,
        UUID userId,
        String userName,
        String text,
        OffsetDateTime createdAt) {
}