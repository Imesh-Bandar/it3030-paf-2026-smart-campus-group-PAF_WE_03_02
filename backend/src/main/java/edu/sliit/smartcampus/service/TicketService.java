package edu.sliit.smartcampus.service;

import edu.sliit.smartcampus.model.*;
import edu.sliit.smartcampus.repository.TicketRepository;
import edu.sliit.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;

    /**
     * Report a new ticket and notify admins/technicians if severity is high
     */
    @Transactional
    public void createTicket(UUID resourceId, UUID reporterId, String title, String description, String severity) {
        // Create ticket with OPEN status
        // (Ticket entity creation would happen here)

        // Alert admins and technicians for HIGH/CRITICAL severity
        if ("HIGH".equals(severity) || "CRITICAL".equals(severity)) {
            List<User> admins = userRepository.findByRole(UserRole.ADMIN);
            List<User> technicians = userRepository.findByRole(UserRole.TECHNICIAN);

            for (User admin : admins) {
                notificationService.createNotification(
                        admin.getId(),
                        NotificationType.TICKET,
                        "High Priority Ticket",
                        "A high priority maintenance ticket has been reported: " + title,
                        EntityType.TICKET,
                        resourceId);
            }

            for (User tech : technicians) {
                notificationService.createNotification(
                        tech.getId(),
                        NotificationType.TICKET,
                        "High Priority Ticket",
                        "A high priority maintenance ticket has been reported: " + title,
                        EntityType.TICKET,
                        resourceId);
            }
        }
    }

    /**
     * Assign a technician to a ticket and notify them
     */
    @Transactional
    public void assignTechnician(UUID ticketId, UUID technicianId, UUID adminId) {
        User admin = getCurrentUser();
        if (admin.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Only admins can assign technicians");
        }

        // Verify technician exists
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new RuntimeException("User is not a technician");
        }

        // Update ticket assignment

        // Notify the assigned technician
        notificationService.createNotification(
                technicianId,
                NotificationType.TICKET,
                "Ticket Assigned",
                "You have been assigned a new maintenance ticket",
                EntityType.TICKET,
                ticketId);
    }

    /**
     * Update ticket status and notify reporter
     */
    @Transactional
    public void updateTicketStatus(UUID ticketId, String newStatus, String notes, UUID updaterId) {
        User updater = getCurrentUser();
        if (updater.getRole() != UserRole.ADMIN && updater.getRole() != UserRole.TECHNICIAN) {
            throw new RuntimeException("Only admins and technicians can update ticket status");
        }

        // Verify valid status transition
        // Update ticket status

        // Notify the ticket reporter
        UUID reporterId = UUID.randomUUID(); // Would be fetched from actual ticket
        notificationService.createNotification(
                reporterId,
                NotificationType.TICKET,
                "Ticket Status Updated",
                "Your ticket status has been updated to: " + newStatus,
                EntityType.TICKET,
                ticketId);
    }

    /**
     * Add a comment to a ticket and notify relevant parties
     */
    @Transactional
    public void addComment(UUID ticketId, String text, UUID commenterId) {
        User commenter = getCurrentUser();

        // Create comment record

        // Notify relevant users based on commenter role
        if (commenter.getRole() == UserRole.ADMIN || commenter.getRole() == UserRole.TECHNICIAN) {
            // If admin/tech comments, notify the reporter
            UUID reporterId = UUID.randomUUID(); // Would be fetched from actual ticket
            notificationService.createNotification(
                    reporterId,
                    NotificationType.TICKET,
                    "Ticket Comment",
                    "A new comment has been added to your ticket",
                    EntityType.TICKET,
                    ticketId);
        } else {
            // If reporter comments, notify assigned tech and admin
            UUID assignedTechId = UUID.randomUUID(); // Would be fetched from actual ticket
            if (assignedTechId != null) {
                notificationService.createNotification(
                        assignedTechId,
                        NotificationType.TICKET,
                        "Ticket Comment",
                        "The reporter has commented on the ticket",
                        EntityType.TICKET,
                        ticketId);
            }
        }
    }

    /**
     * Get tickets for authenticated user
     */
    public Page<Object> getUserTickets(UUID userId, Pageable pageable) {
        return ticketRepository.findByReporterId(userId, pageable);
    }

    /**
     * Get tickets assigned to technician
     */
    public Page<Object> getAssignedTickets(UUID technicianId, Pageable pageable) {
        return ticketRepository.findByAssignedTo(technicianId, pageable);
    }

    /**
     * Get all tickets (admin view)
     */
    public Page<Object> getAllTickets(Pageable pageable) {
        return ticketRepository.findAll(pageable);
    }

    /**
     * Get count of tickets by status for dashboard
     */
    public long getTicketCountByStatus(String status) {
        return ticketRepository.countByStatus(status);
    }

    /**
     * Get tickets by severity for dashboard
     */
    public long getTicketCountBySeverity(String severity) {
        return ticketRepository.countBySeverity(severity);
    }

    /**
     * Verify if user has access to view ticket
     */
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
}
