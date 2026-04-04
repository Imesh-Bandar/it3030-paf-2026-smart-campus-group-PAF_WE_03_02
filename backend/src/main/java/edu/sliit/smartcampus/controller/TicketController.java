package edu.sliit.smartcampus.controller;

import java.util.List;
import java.util.UUID;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import edu.sliit.smartcampus.dto.TicketAssignRequest;
import edu.sliit.smartcampus.dto.TicketCommentDto;
import edu.sliit.smartcampus.dto.TicketCommentRequest;
import edu.sliit.smartcampus.dto.TicketCreateRequest;
import edu.sliit.smartcampus.dto.TicketDetailDto;
import edu.sliit.smartcampus.dto.TicketEvidenceDto;
import edu.sliit.smartcampus.dto.TicketSummaryDto;
import edu.sliit.smartcampus.dto.TicketUpdateStatusRequest;
import edu.sliit.smartcampus.model.TicketCategory;
import edu.sliit.smartcampus.model.TicketSeverity;
import edu.sliit.smartcampus.model.TicketStatus;
import edu.sliit.smartcampus.service.TicketService;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketDetailDto> createTicket(@Valid @RequestBody TicketCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request));
    }

    @GetMapping
    public ResponseEntity<Page<TicketSummaryDto>> listTickets(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketSeverity severity,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) UUID resourceId,
            @RequestParam(required = false) UUID assignedTo,
            @PageableDefault(size = 20, sort = "createdAt", direction = Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ticketService.listTickets(q, status, severity, category, resourceId, assignedTo, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDetailDto> getTicket(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getTicket(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TicketDetailDto> updateTicketStatus(
            @PathVariable UUID id,
            @Valid @RequestBody TicketUpdateStatusRequest request) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketDetailDto> assignTicket(
            @PathVariable UUID id,
            @Valid @RequestBody TicketAssignRequest request) {
        return ResponseEntity.ok(ticketService.assignTicket(id, request));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentDto> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody TicketCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.addComment(id, request));
    }

    @PostMapping(value = "/evidence", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketEvidenceDto> addEvidence(
            @RequestParam UUID ticketId,
            @RequestParam MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.addEvidence(ticketId, file));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketCommentDto>> getComments(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getComments(id));
    }

    @GetMapping("/{id}/evidence")
    public ResponseEntity<List<TicketEvidenceDto>> getEvidence(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getEvidence(id));
    }
}
