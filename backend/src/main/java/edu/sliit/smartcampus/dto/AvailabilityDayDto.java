package edu.sliit.smartcampus.dto;

import java.time.LocalDate;
import java.util.List;

public record AvailabilityDayDto(
        LocalDate date,
        List<AvailabilitySlotDto> slots) {
}
