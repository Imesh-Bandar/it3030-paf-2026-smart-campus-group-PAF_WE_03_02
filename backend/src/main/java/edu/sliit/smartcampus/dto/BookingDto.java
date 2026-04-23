package edu.sliit.smartcampus.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

public record BookingDto(
        UUID id,
        UUID resourceId,
        String resourceName,
        UUID bookerId,
        String bookerName,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        String purpose,
        String status,
        String rejectedReason,
        String qrToken,
        OffsetDateTime approvedAt,
        OffsetDateTime checkedInAt,
        UUID checkedInBy,
        boolean waitlisted,
        Integer waitlistPosition,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
}
