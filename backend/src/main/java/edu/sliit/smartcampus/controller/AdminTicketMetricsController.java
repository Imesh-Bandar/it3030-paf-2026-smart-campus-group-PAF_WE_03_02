package edu.sliit.smartcampus.controller;

import edu.sliit.smartcampus.dto.AssignmentSuggestionDto;
import edu.sliit.smartcampus.dto.TechnicianWorkloadDto;
import edu.sliit.smartcampus.dto.TicketSlaMetricsDto;
import edu.sliit.smartcampus.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Ticket Metrics", description = "Developer 3 SLA and technician workload APIs")
public class AdminTicketMetricsController {
    private final TicketService ticketService;

    public AdminTicketMetricsController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/tickets/sla-metrics")
    @Operation(summary = "Get ticket SLA metrics")
    public ResponseEntity<TicketSlaMetricsDto> getSlaMetrics() {
        return ResponseEntity.ok(ticketService.getSlaMetrics());
    }

    @GetMapping("/technician-workload")
    @Operation(summary = "Get technician workload metrics")
    public ResponseEntity<List<TechnicianWorkloadDto>> getTechnicianWorkloads() {
        return ResponseEntity.ok(ticketService.getTechnicianWorkloads());
    }

    @GetMapping("/tickets/{id}/assignment-suggestion")
    @Operation(summary = "Suggest technician assignment for a ticket")
    public ResponseEntity<AssignmentSuggestionDto> suggestAssignee(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.suggestAssignee(id));
    }
}
