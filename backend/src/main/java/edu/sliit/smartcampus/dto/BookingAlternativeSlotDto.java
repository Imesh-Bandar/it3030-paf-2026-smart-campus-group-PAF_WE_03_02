package edu.sliit.smartcampus.dto;

import java.time.LocalTime;

public record BookingAlternativeSlotDto(LocalTime startTime, LocalTime endTime) {
}
