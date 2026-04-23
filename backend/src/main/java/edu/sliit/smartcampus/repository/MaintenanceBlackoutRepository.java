package edu.sliit.smartcampus.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import edu.sliit.smartcampus.model.MaintenanceBlackout;

public interface MaintenanceBlackoutRepository extends JpaRepository<MaintenanceBlackout, UUID> {
    List<MaintenanceBlackout> findByResource_IdOrderByStartDateAsc(UUID resourceId);

    Optional<MaintenanceBlackout> findByIdAndResource_Id(UUID id, UUID resourceId);

    @Query("""
            SELECT b FROM MaintenanceBlackout b
            WHERE b.resource.id = :resourceId
              AND b.startDate < :endDate
              AND b.endDate > :startDate
            ORDER BY b.startDate ASC
            """)
    List<MaintenanceBlackout> findOverlapping(
            @Param("resourceId") UUID resourceId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate);
}
