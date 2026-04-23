package edu.sliit.smartcampus.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record ResourceDto(
        UUID id,
        String resourceCode,
        String name,
        String type,
        String status,
        String location,
        Integer capacity,
        String description,
        String thumbnailUrl,
        List<String> amenities,
        Map<String, String> specifications,
        List<AvailabilityWindowDto> availabilityWindows,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
