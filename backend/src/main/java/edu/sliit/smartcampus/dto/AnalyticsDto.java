package edu.sliit.smartcampus.dto;

import java.util.List;
import java.util.Map;

public record AnalyticsDto(
        List<TopResourceDto> topResources,
        Map<Integer, Long> peakBookingHours) {

    public record TopResourceDto(
            String resourceId,
            String resourceName,
            long bookingCount) {
    }
}
