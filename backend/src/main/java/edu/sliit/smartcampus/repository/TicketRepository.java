package edu.sliit.smartcampus.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import edu.sliit.smartcampus.model.Ticket;
import edu.sliit.smartcampus.model.TicketPriority;
import edu.sliit.smartcampus.model.TicketStatus;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findByDeletedAtIsNullOrderByCreatedAtDesc();

    List<Ticket> findByReporter_IdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID reporterId);

    List<Ticket> findByAssignee_IdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID assigneeId);

    List<Ticket> findByStatusAndDeletedAtIsNullOrderByCreatedAtDesc(TicketStatus status);

    long countByStatusAndDeletedAtIsNull(TicketStatus status);

    long countByPriorityAndDeletedAtIsNull(TicketPriority priority);

    long countBySlaBreachedTrueAndDeletedAtIsNull();

    long countByAssignee_IdAndStatusInAndDeletedAtIsNull(UUID assigneeId, List<TicketStatus> statuses);

    long countByAssignee_IdAndSlaBreachedTrueAndDeletedAtIsNull(UUID assigneeId);

    @Query("""
            select t from Ticket t
            where t.deletedAt is null
              and (:status is null or t.status = :status)
              and (:assigneeId is null or t.assignee.id = :assigneeId)
              and (:reporterId is null or t.reporter.id = :reporterId)
            order by t.createdAt desc
            """)
    List<Ticket> search(
            @Param("status") TicketStatus status,
            @Param("assigneeId") UUID assigneeId,
            @Param("reporterId") UUID reporterId);

    @Query("""
            select coalesce(max(t.ticketNumber), '') from Ticket t
            where t.ticketNumber like :prefix
            """)
    String findMaxTicketNumberForPrefix(@Param("prefix") String prefix);

}
