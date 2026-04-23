package edu.sliit.smartcampus.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ResourceAvailabilityDto(
        UUID resourceId,
        String resourceName,
        LocalDate from,
        LocalDate to,
        List<AvailabilityDayDto> availability) {
}
