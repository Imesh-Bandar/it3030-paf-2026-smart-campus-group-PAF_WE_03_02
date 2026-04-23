package edu.sliit.smartcampus.dto;

import java.time.LocalTime;
import java.util.UUID;

public record AvailabilityWindowDto(
        UUID id,
        Integer dayOfWeek,
        LocalTime startTime,
        LocalTime endTime) {
}
