package edu.sliit.smartcampus.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TicketEvidenceDto(
        UUID id,
        String url,
        UUID uploadedById,
        String uploadedByName,
        OffsetDateTime uploadedAt) {
}