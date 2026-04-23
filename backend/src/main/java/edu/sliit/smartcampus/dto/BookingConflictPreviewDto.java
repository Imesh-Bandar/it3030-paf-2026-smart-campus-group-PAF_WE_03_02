package edu.sliit.smartcampus.dto;

import java.util.List;

public record BookingConflictPreviewDto(
        boolean conflictDetected,
        String message,
        List<BookingAlternativeSlotDto> alternatives) {
}
