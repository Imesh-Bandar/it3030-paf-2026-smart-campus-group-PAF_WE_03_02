package edu.sliit.smartcampus.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import edu.sliit.smartcampus.model.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, UUID>, JpaSpecificationExecutor<Ticket> {
	Optional<Ticket> findByTicketNumber(String ticketNumber);
}
