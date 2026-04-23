package edu.sliit.smartcampus.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record TicketDto(
        UUID id,
        String ticketNumber,
        String title,
        String description,
        String category,
        String priority,
        String status,
        String location,
        UUID reporterId,
        String reporterName,
        UUID assigneeId,
        String assigneeName,
        OffsetDateTime firstResponseAt,
        OffsetDateTime resolvedAt,
        boolean slaBreached,
        long elapsedMinutes,
        long resolutionMinutes,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<TicketAttachmentDto> attachments,
        List<TicketCommentDto> comments) {
}
