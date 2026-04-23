package edu.sliit.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public record BookingCheckInRequestDto(@NotBlank String qrToken) {
}
