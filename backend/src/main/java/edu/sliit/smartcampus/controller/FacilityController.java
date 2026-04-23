package edu.sliit.smartcampus.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import edu.sliit.smartcampus.dto.BookingDto;
import edu.sliit.smartcampus.dto.ResourceOptionDto;
import edu.sliit.smartcampus.repository.ResourceRepository;
import edu.sliit.smartcampus.service.BookingService;

@RestController
@RequestMapping("/api/v1/resources")
@Tag(name = "Resources", description = "Facility lookup and booking calendar APIs")
public class FacilityController {

    private final BookingService bookingService;
    private final ResourceRepository resourceRepository;

    public FacilityController(BookingService bookingService, ResourceRepository resourceRepository) {
        this.bookingService = bookingService;
        this.resourceRepository = resourceRepository;
    }

    @GetMapping
    @Operation(summary = "List resources", description = "Returns lightweight resource options for booking forms.")
    public ResponseEntity<List<ResourceOptionDto>> listResources() {
        List<ResourceOptionDto> resources = resourceRepository.findAll()
                .stream()
                .map(resource -> new ResourceOptionDto(resource.getId(), resource.getName()))
                .toList();
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/{resourceId}/bookings")
    @Operation(summary = "Get resource calendar", description = "Returns bookings for a specific resource and date.")
    public ResponseEntity<List<BookingDto>> getResourceBookings(
            @Parameter(description = "Resource identifier") @PathVariable UUID resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(bookingService.getResourceBookings(resourceId, date));
    }
}
