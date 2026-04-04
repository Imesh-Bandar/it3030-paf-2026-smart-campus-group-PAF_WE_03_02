package edu.sliit.smartcampus.controller;

import edu.sliit.smartcampus.service.AuthService;
import edu.sliit.smartcampus.service.BookingService;
import edu.sliit.smartcampus.service.FacilityService;
import edu.sliit.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final BookingService bookingService;
    private final TicketService ticketService;
    private final FacilityService facilityService;
    private final AuthService authService;

    /**
     * Get user dashboard stats
     */
    @GetMapping("/user/stats")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getUserDashboardStats() {
        UUID userId = authService.getCurrentUserId();

        Map<String, Object> stats = new HashMap<>();
        stats.put("activeBookings", bookingService.getBookingCountByStatus("CONFIRMED"));
        stats.put("pendingBookings", bookingService.getBookingCountByStatus("PENDING"));
        stats.put("openTickets", ticketService.getTicketCountByStatus("OPEN"));
        stats.put("inProgressTickets", ticketService.getTicketCountByStatus("IN_PROGRESS"));

        return ResponseEntity.ok(stats);
    }

    /**
     * Get admin dashboard stats
     */
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // KPI Cards
        stats.put("totalUsers", 0); // Would query UserRepository.count()
        stats.put("totalResources", facilityService.getActiveFacilityCount());
        stats.put("pendingBookings", bookingService.getBookingCountByStatus("PENDING"));
        stats.put("openTickets", ticketService.getTicketCountByStatus("OPEN"));

        // Booking status breakdown
        Map<String, Long> bookingStats = new HashMap<>();
        bookingStats.put("pending", bookingService.getBookingCountByStatus("PENDING"));
        bookingStats.put("confirmed", bookingService.getBookingCountByStatus("CONFIRMED"));
        bookingStats.put("rejected", bookingService.getBookingCountByStatus("REJECTED"));
        bookingStats.put("cancelled", bookingService.getBookingCountByStatus("CANCELLED"));
        stats.put("bookingStats", bookingStats);

        // Ticket severity breakdown
        Map<String, Long> ticketStats = new HashMap<>();
        ticketStats.put("critical", ticketService.getTicketCountBySeverity("CRITICAL"));
        ticketStats.put("high", ticketService.getTicketCountBySeverity("HIGH"));
        ticketStats.put("medium", ticketService.getTicketCountBySeverity("MEDIUM"));
        ticketStats.put("low", ticketService.getTicketCountBySeverity("LOW"));
        stats.put("ticketStats", ticketStats);

        // Ticket status breakdown
        Map<String, Long> ticketStatusStats = new HashMap<>();
        ticketStatusStats.put("open", ticketService.getTicketCountByStatus("OPEN"));
        ticketStatusStats.put("inProgress", ticketService.getTicketCountByStatus("IN_PROGRESS"));
        ticketStatusStats.put("resolved", ticketService.getTicketCountByStatus("RESOLVED"));
        stats.put("ticketStatusStats", ticketStatusStats);

        return ResponseEntity.ok(stats);
    }

    /**
     * Get technician dashboard stats
     */
    @GetMapping("/technician/stats")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<Map<String, Object>> getTechnicianDashboardStats() {
        UUID userId = authService.getCurrentUserId();

        Map<String, Object> stats = new HashMap<>();

        // Assigned tickets status breakdown
        Map<String, Long> ticketStats = new HashMap<>();
        ticketStats.put("open", ticketService.getTicketCountByStatus("OPEN"));
        ticketStats.put("inProgress", ticketService.getTicketCountByStatus("IN_PROGRESS"));
        ticketStats.put("resolved", ticketService.getTicketCountByStatus("RESOLVED"));
        stats.put("assignedTickets", ticketStats);

        stats.put("resolvedThisWeek", 0); // Would calculate from ticket status history
        stats.put("averageResolutionTime", 0); // Would calculate from ticket data

        return ResponseEntity.ok(stats);
    }

    /**
     * Get booking stats by date range (for charts)
     */
    @GetMapping("/admin/bookings-by-date")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getBookingsByDate() {
        Map<String, Object> data = new HashMap<>();
        // Would query database for booking trends over last 30 days
        data.put("message", "Booking trend data");
        return ResponseEntity.ok(data);
    }

    /**
     * Get resource utilization (for charts)
     */
    @GetMapping("/admin/resource-utilization")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getResourceUtilization() {
        Map<String, Object> data = new HashMap<>();
        // Would calculate utilization percentage for each resource
        data.put("message", "Resource utilization data");
        return ResponseEntity.ok(data);
    }
}
