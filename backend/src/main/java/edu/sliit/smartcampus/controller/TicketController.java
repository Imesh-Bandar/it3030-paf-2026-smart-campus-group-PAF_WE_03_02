package edu.sliit.smartcampus.controller;

import java.util.UUID;
import edu.sliit.smartcampus.dto.TicketCreateRequest;
import edu.sliit.smartcampus.dto.TicketResponse;
import edu.sliit.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dev3/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    //@PreAuthorize("hasAnyRole('STUDENT', 'STAFF', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody TicketCreateRequest request) {
        TicketResponse response = ticketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/status")
    //@PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<java.util.Map<String, String>> updateTicketStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(java.util.Map.of("message", "Ticket status updated", "ticketId", id.toString()));
    }
}
