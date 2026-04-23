package edu.sliit.smartcampus.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;

public record ResourceRequestDto(
        @NotBlank @Size(min = 3, max = 50) String resourceCode,
        @NotBlank @Size(min = 3, max = 120) String name,
        @NotBlank String type,
        String status,
        @NotBlank @Size(min = 5, max = 200) String location,
        @NotNull @Min(1) @Max(1000) Integer capacity,
        @Size(max = 2000) String description,
        @Size(max = 500) String thumbnailUrl,
        List<@NotBlank @Size(max = 120) String> amenities,
        Map<@Size(max = 100) String, @Size(max = 500) String> specifications,
        @Valid @NotEmpty List<AvailabilityWindowRequestDto> availabilityWindows) {
}
