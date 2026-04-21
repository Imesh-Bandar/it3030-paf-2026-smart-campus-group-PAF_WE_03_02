package edu.sliit.smartcampus.service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import edu.sliit.smartcampus.dto.AnalyticsDto.TopResourceDto;
import edu.sliit.smartcampus.repository.BookingRepository;

/**
 * D4-B24: Admin analytics service for top resources and peak booking hours.
 * Provides stubs that will return real data once Booking entity is fully built by Dev 2.
 */
@Service
public class AnalyticsService {

    private final BookingRepository bookingRepository;

    public AnalyticsService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    /**
     * Returns the most booked resources.
     * Currently returns placeholder data; will populate once Booking entity has resource + timestamp fields.
     */
    public List<TopResourceDto> getTopResources(int limit) {
        long totalBookings = bookingRepository.count();
        if (totalBookings == 0) {
            return Collections.emptyList();
        }
        // Placeholder until Dev 2 adds resource_id and created_at columns to Booking
        return List.of(
                new TopResourceDto("n/a", "Data available once bookings include resource references", totalBookings));
    }

    /**
     * Returns booking counts grouped by hour of day (0-23).
     * Currently returns empty map; will populate once Booking entity has created_at field.
     */
    public Map<Integer, Long> getPeakBookingHours() {
        return Collections.emptyMap();
    }
}
