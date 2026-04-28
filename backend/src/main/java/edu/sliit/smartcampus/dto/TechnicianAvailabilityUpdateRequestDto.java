package edu.sliit.smartcampus.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TechnicianAvailabilityUpdateRequestDto(
        @NotNull Boolean available,
        @Size(max = 160) String note) {
}
