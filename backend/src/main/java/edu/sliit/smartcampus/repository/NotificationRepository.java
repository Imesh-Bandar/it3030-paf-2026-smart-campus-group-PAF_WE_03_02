package edu.sliit.smartcampus.repository;

import java.util.List;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;
import edu.sliit.smartcampus.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByUser_IdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<Notification> findByUser_IdAndReadFalse(UUID userId);

    long countByUser_IdAndReadFalse(UUID userId);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :readAt WHERE n.user.id = :userId AND n.read = false")
    int markAllReadByUserId(@Param("userId") UUID userId, @Param("readAt") OffsetDateTime readAt);
}
