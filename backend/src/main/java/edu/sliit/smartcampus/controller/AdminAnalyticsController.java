package edu.sliit.smartcampus.controller;

import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import edu.sliit.smartcampus.dto.AnalyticsDto.TopResourceDto;
import edu.sliit.smartcampus.service.AnalyticsService;

/**
 * D4-B24: Admin analytics endpoints.
 * GET /api/v1/admin/analytics/top-resources
 * GET /api/v1/admin/analytics/peak-booking-hours
 */
@RestController
@RequestMapping("/api/v1/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    public AdminAnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/top-resources")
    public ResponseEntity<List<TopResourceDto>> getTopResources(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(analyticsService.getTopResources(limit));
    }

    @GetMapping("/peak-booking-hours")
    public ResponseEntity<Map<Integer, Long>> getPeakBookingHours() {
        return ResponseEntity.ok(analyticsService.getPeakBookingHours());
    }
}
