package edu.sliit.smartcampus.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import edu.sliit.smartcampus.model.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    Page<Ticket> findByReporterId(UUID reporterId, Pageable pageable);

    Page<Ticket> findByAssignedTo(UUID technicianId, Pageable pageable);

    Page<Ticket> findByStatus(String status, Pageable pageable);

    Page<Ticket> findBySeverity(String severity, Pageable pageable);

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    long countByStatus(String status);

    long countBySeverity(String severity);
}
