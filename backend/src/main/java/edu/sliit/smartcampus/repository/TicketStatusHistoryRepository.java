package edu.sliit.smartcampus.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import edu.sliit.smartcampus.model.TicketStatusHistory;

public interface TicketStatusHistoryRepository extends JpaRepository<TicketStatusHistory, UUID> {
    List<TicketStatusHistory> findByTicket_IdOrderByCreatedAtAsc(UUID ticketId);
}