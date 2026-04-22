package edu.sliit.smartcampus.service;

import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import edu.sliit.smartcampus.dto.TicketCreateRequest;
import edu.sliit.smartcampus.dto.TicketResponse;
import edu.sliit.smartcampus.exception.ResourceNotFoundException;
import edu.sliit.smartcampus.model.Resource;
import edu.sliit.smartcampus.model.Ticket;
import edu.sliit.smartcampus.model.TicketStatus;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.repository.ResourceRepository;
import edu.sliit.smartcampus.repository.TicketRepository;
import edu.sliit.smartcampus.repository.UserRepository;

@Service
public class TicketService {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final TicketRepository ticketRepository;

    public TicketService(
            AuthService authService,
            UserRepository userRepository,
            ResourceRepository resourceRepository,
            TicketRepository ticketRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.ticketRepository = ticketRepository;
    }

    @Transactional
    public TicketResponse createTicket(TicketCreateRequest request) {
        UUID currentUserId = authService.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        // Validate the facility first so we never persist a ticket that points to a missing resource.
        Resource resource = resourceRepository.findById(request.resourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        Ticket ticket = new Ticket();
        ticket.setResourceId(resource.getId());
        ticket.setReporterId(currentUser.getId());
        ticket.setTitle(request.title().trim());
        ticket.setDescription(request.description().trim());
        // The entity stores simple UUID-backed fields here to avoid JSON recursion and lazy-loading issues.
        ticket.setPriority(request.severity());
        ticket.setCategory(request.category());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setLocation(request.location() == null ? null : request.location().trim());
        ticket.setCreatedAt(OffsetDateTime.now());
        ticket.setUpdatedAt(OffsetDateTime.now());

        Ticket saved = ticketRepository.save(ticket);
        return toResponse(saved, resource, currentUser);
    }

    public boolean canViewTicket(UUID reporterId, UUID assignedTechnicianId) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == UserRole.ADMIN) {
            return true;
        }
        if (currentUser.getId().equals(reporterId)) {
            return true;
        }
        return assignedTechnicianId != null && currentUser.getId().equals(assignedTechnicianId);
    }

    private User getCurrentUser() {
        UUID currentUserId = authService.getCurrentUserId();
        return userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }

    private TicketResponse toResponse(Ticket ticket, Resource resource, User reporter) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getTicketNumber(),
                ticket.getResourceId(),
                resource.getName(),
                reporter.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getPriority(),
                ticket.getCategory(),
                ticket.getStatus(),
                ticket.getAssigneeId(),
                ticket.getLocation(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt());
    }
}
