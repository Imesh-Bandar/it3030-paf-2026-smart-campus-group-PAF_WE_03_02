package edu.sliit.smartcampus.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TicketCommentDto(
        UUID id,
        UUID authorId,
        String authorName,
        String authorRole,
        String content,
        boolean internal,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
