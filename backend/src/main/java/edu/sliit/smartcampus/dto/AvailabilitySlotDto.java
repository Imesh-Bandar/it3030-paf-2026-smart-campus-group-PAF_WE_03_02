package edu.sliit.smartcampus.dto;

import java.time.LocalTime;
import java.util.UUID;

public record AvailabilitySlotDto(
        LocalTime startTime,
        LocalTime endTime,
        String status,
        UUID bookingId,
        String bookedBy,
        String reason) {
}
