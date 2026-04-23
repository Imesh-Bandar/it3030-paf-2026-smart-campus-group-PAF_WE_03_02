package edu.sliit.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record MaintenanceBlackoutRequestDto(
        @NotNull OffsetDateTime startDate,
        @NotNull OffsetDateTime endDate,
        @NotBlank String reason) {
}
