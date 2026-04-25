package edu.sliit.smartcampus.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import edu.sliit.smartcampus.model.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {
}
