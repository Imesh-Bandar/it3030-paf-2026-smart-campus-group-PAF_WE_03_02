package edu.sliit.smartcampus.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import edu.sliit.smartcampus.model.TicketComment;

public interface TicketCommentRepository extends JpaRepository<TicketComment, UUID> {
    List<TicketComment> findByTicket_IdAndDeletedAtIsNullOrderByCreatedAtAsc(UUID ticketId);

    Optional<TicketComment> findByIdAndTicket_IdAndDeletedAtIsNull(UUID id, UUID ticketId);
}
