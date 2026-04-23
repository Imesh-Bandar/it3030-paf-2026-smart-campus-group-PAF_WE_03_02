package edu.sliit.smartcampus.controller;

import edu.sliit.smartcampus.dto.ApiMessage;
import edu.sliit.smartcampus.dto.TicketAssignRequestDto;
import edu.sliit.smartcampus.dto.TicketAttachmentDto;
import edu.sliit.smartcampus.dto.TicketCommentDto;
import edu.sliit.smartcampus.dto.TicketCommentRequestDto;
import edu.sliit.smartcampus.dto.TicketDto;
import edu.sliit.smartcampus.dto.TicketStatusUpdateRequestDto;
import edu.sliit.smartcampus.model.TicketStatus;
import edu.sliit.smartcampus.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/tickets")
@Tag(name = "Tickets", description = "Developer 3 maintenance and incident ticket APIs")
public class TicketController {
    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a maintenance ticket with up to 3 image attachments")
    public ResponseEntity<TicketDto> createTicket(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam(defaultValue = "MEDIUM") String priority,
            @RequestParam(required = false) String location,
            @RequestParam(name = "files", required = false) List<MultipartFile> files) {
        return ResponseEntity.status(201)
                .body(ticketService.createTicket(title, description, category, priority, location, files));
    }

    @GetMapping
    @Operation(summary = "List tickets scoped by current role")
    public ResponseEntity<List<TicketDto>> listTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) UUID assigneeId,
            @RequestParam(required = false) UUID reporterId) {
        return ResponseEntity.ok(ticketService.listTickets(status, assigneeId, reporterId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ticket details with comments and attachments")
    public ResponseEntity<TicketDto> getTicket(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.getTicket(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @Operation(summary = "Update ticket status")
    public ResponseEntity<TicketDto> updateTicketStatus(
            @PathVariable UUID id,
            @Valid @RequestBody TicketStatusUpdateRequestDto request) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign a technician")
    public ResponseEntity<TicketDto> assignTicket(
            @PathVariable UUID id,
            @Valid @RequestBody TicketAssignRequestDto request) {
        return ResponseEntity.ok(ticketService.assignTicket(id, request.technicianId()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a ticket")
    public ResponseEntity<ApiMessage> deleteTicket(@PathVariable UUID id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(new ApiMessage("Ticket deleted"));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add a ticket comment")
    public ResponseEntity<TicketCommentDto> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody TicketCommentRequestDto request) {
        return ResponseEntity.status(201).body(ticketService.addComment(id, request));
    }

    @PutMapping("/{id}/comments/{commentId}")
    @Operation(summary = "Edit a ticket comment")
    public ResponseEntity<TicketCommentDto> updateComment(
            @PathVariable UUID id,
            @PathVariable UUID commentId,
            @Valid @RequestBody TicketCommentRequestDto request) {
        return ResponseEntity.ok(ticketService.updateComment(id, commentId, request));
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    @Operation(summary = "Delete a ticket comment")
    public ResponseEntity<ApiMessage> deleteComment(
            @PathVariable UUID id,
            @PathVariable UUID commentId) {
        ticketService.deleteComment(id, commentId);
        return ResponseEntity.ok(new ApiMessage("Comment deleted"));
    }

    @GetMapping("/{id}/attachments")
    @Operation(summary = "List ticket attachments")
    public ResponseEntity<List<TicketAttachmentDto>> listAttachments(@PathVariable UUID id) {
        return ResponseEntity.ok(ticketService.listAttachments(id));
    }
}
