package edu.sliit.smartcampus.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import edu.sliit.smartcampus.dto.ApiMessage;
import edu.sliit.smartcampus.dto.MaintenanceBlackoutDto;
import edu.sliit.smartcampus.dto.MaintenanceBlackoutRequestDto;
import edu.sliit.smartcampus.dto.ResourceAvailabilityDto;
import edu.sliit.smartcampus.dto.ResourceDto;
import edu.sliit.smartcampus.dto.ResourceRequestDto;
import edu.sliit.smartcampus.service.FacilityService;

@RestController
@RequestMapping("/api/v1/resources")
@Tag(name = "Resources", description = "Developer 1 facilities and assets catalogue APIs")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @GetMapping
    @Operation(summary = "List resources with filters")
    public ResponseEntity<List<ResourceDto>> listResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer capacityMin,
            @RequestParam(required = false) Integer capacityMax,
            @RequestParam(required = false, name = "q") String query) {
        return ResponseEntity.ok(facilityService.listResources(type, status, capacityMin, capacityMax, query));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resource details")
    public ResponseEntity<ResourceDto> getResource(
            @Parameter(description = "Resource identifier") @PathVariable UUID id) {
        return ResponseEntity.ok(facilityService.getResource(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create resource")
    public ResponseEntity<ResourceDto> createResource(@Valid @RequestBody ResourceRequestDto request) {
        return ResponseEntity.status(201).body(facilityService.createResource(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update resource")
    public ResponseEntity<ResourceDto> updateResource(
            @PathVariable UUID id,
            @Valid @RequestBody ResourceRequestDto request) {
        return ResponseEntity.ok(facilityService.updateResource(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft delete resource")
    public ResponseEntity<ApiMessage> deleteResource(@PathVariable UUID id) {
        facilityService.deleteResource(id);
        return ResponseEntity.ok(new ApiMessage("Resource deleted"));
    }

    @GetMapping("/{id}/availability")
    @Operation(summary = "Get resource availability")
    public ResponseEntity<ResourceAvailabilityDto> getAvailability(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(facilityService.getAvailability(id, from, to));
    }

    @GetMapping("/{id}/maintenance-blackouts")
    @Operation(summary = "List maintenance blackouts")
    public ResponseEntity<List<MaintenanceBlackoutDto>> getMaintenanceBlackouts(@PathVariable UUID id) {
        return ResponseEntity.ok(facilityService.getMaintenanceBlackouts(id));
    }

    @PostMapping("/{id}/maintenance-blackouts")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create maintenance blackout")
    public ResponseEntity<MaintenanceBlackoutDto> createMaintenanceBlackout(
            @PathVariable UUID id,
            @Valid @RequestBody MaintenanceBlackoutRequestDto request) {
        return ResponseEntity.status(201).body(facilityService.createMaintenanceBlackout(id, request));
    }
}
