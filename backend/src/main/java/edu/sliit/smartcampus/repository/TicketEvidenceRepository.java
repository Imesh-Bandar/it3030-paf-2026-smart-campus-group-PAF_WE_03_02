package edu.sliit.smartcampus.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import edu.sliit.smartcampus.model.TicketEvidence;

public interface TicketEvidenceRepository extends JpaRepository<TicketEvidence, UUID> {
    List<TicketEvidence> findByTicket_IdOrderByUploadedAtAsc(UUID ticketId);

    long countByTicket_Id(UUID ticketId);
}