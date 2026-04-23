package edu.sliit.smartcampus.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TicketAttachmentDto(
        UUID id,
        String fileName,
        String fileUrl,
        Long fileSize,
        String mimeType,
        UUID uploadedById,
        String uploadedByName,
        OffsetDateTime createdAt) {
}
