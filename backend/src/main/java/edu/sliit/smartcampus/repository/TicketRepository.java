package edu.sliit.smartcampus.repository;

import edu.sliit.smartcampus.model.Ticket;
import edu.sliit.smartcampus.model.TicketCategory;
import edu.sliit.smartcampus.model.TicketPriority;
import edu.sliit.smartcampus.model.TicketStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {
	List<Ticket> findByReporterId(UUID reporterId);

	List<Ticket> findByAssigneeId(UUID assigneeId);

	List<Ticket> findByStatus(TicketStatus status);

	List<Ticket> findByCategory(TicketCategory category);

	List<Ticket> findByPriority(TicketPriority priority);
}
