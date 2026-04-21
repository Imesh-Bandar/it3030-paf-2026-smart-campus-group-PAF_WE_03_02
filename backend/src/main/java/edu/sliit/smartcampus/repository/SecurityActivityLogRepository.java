package edu.sliit.smartcampus.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import edu.sliit.smartcampus.model.SecurityActivityLog;
import edu.sliit.smartcampus.model.SecurityEventType;

public interface SecurityActivityLogRepository extends JpaRepository<SecurityActivityLog, UUID> {

    Page<SecurityActivityLog> findByUser_IdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<SecurityActivityLog> findByUser_IdAndSuspiciousTrue(UUID userId);

    long countByUser_IdAndEventType(UUID userId, SecurityEventType eventType);

    @Modifying
        @Query("update SecurityActivityLog l set l.acknowledgedAt = :ackAt " +
            "where l.user.id = :userId and l.suspicious = true and l.acknowledgedAt is null")
        int acknowledgeSuspiciousByUserId(@Param("userId") UUID userId, @Param("ackAt") OffsetDateTime ackAt);
}
