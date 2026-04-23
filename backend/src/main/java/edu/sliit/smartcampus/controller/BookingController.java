package edu.sliit.smartcampus.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import edu.sliit.smartcampus.dto.BookingActionRequestDto;
import edu.sliit.smartcampus.dto.BookingCheckInRequestDto;
import edu.sliit.smartcampus.dto.BookingConflictPreviewDto;
import edu.sliit.smartcampus.dto.BookingDto;
import edu.sliit.smartcampus.dto.BookingRequestDto;
import edu.sliit.smartcampus.service.BookingService;

@RestController
@RequestMapping("/api/v1/bookings")
@Tag(name = "Bookings", description = "Developer 2 booking workflow APIs")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @Operation(summary = "Create a booking request", description = "Creates a booking and auto-adds it to the waitlist when the approved slot is already full.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Booking request created",
                    content = @Content(schema = @Schema(implementation = BookingDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid booking request", content = @Content)
    })
    public ResponseEntity<BookingDto> createBooking(@Valid @RequestBody BookingRequestDto request) {
        return ResponseEntity.status(201).body(bookingService.createBooking(request));
    }

    @PostMapping("/conflicts/preview")
    @Operation(summary = "Preview booking conflicts", description = "Checks an intended slot against approved bookings and suggests alternative times.")
    public ResponseEntity<BookingConflictPreviewDto> previewConflicts(@Valid @RequestBody BookingRequestDto request) {
        return ResponseEntity.ok(bookingService.previewConflict(request));
    }

    @GetMapping
    @Operation(summary = "List my bookings", description = "Returns bookings belonging to the authenticated user.")
    @ApiResponse(responseCode = "200", description = "Bookings returned",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = BookingDto.class))))
    public ResponseEntity<List<BookingDto>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getCurrentUserBookings());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by id")
    public ResponseEntity<BookingDto> getBooking(
            @Parameter(description = "Booking identifier") @PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.getBooking(id));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve a booking", description = "Admin-only approval that also generates the QR check-in token.")
    public ResponseEntity<BookingDto> approveBooking(
            @Parameter(description = "Booking identifier") @PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reject a booking", description = "Admin-only rejection with an optional reason.")
    public ResponseEntity<BookingDto> rejectBooking(
            @Parameter(description = "Booking identifier") @PathVariable UUID id,
            @RequestBody(required = false) BookingActionRequestDto request) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, request));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking", description = "Cancels an active booking and auto-promotes the next waitlisted request when applicable.")
    public ResponseEntity<BookingDto> cancelBooking(
            @Parameter(description = "Booking identifier") @PathVariable UUID id,
            @RequestBody(required = false) BookingActionRequestDto request) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, request));
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Verify QR check-in", description = "Marks an approved booking as completed after QR token validation.")
    public ResponseEntity<BookingDto> verifyCheckIn(
            @Parameter(description = "Booking identifier") @PathVariable UUID id,
            @Valid @RequestBody BookingCheckInRequestDto request) {
        return ResponseEntity.ok(bookingService.verifyCheckIn(id, request));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List admin booking queue", description = "Returns pending bookings for admin review.")
    public ResponseEntity<List<BookingDto>> getAllBookingsForAdmin() {
        return ResponseEntity.ok(bookingService.getPendingBookingsForAdmin());
    }

    @GetMapping("/resource/{resourceId}")
    @Operation(summary = "List resource bookings by date", description = "Calendar-friendly booking list for a single resource on a single day.")
    public ResponseEntity<List<BookingDto>> getResourceBookings(
            @Parameter(description = "Resource identifier") @PathVariable UUID resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getResourceBookings(resourceId, date));
    }
}
