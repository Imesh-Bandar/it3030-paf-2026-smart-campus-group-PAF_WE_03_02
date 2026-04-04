package edu.sliit.smartcampus.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import edu.sliit.smartcampus.model.Booking;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Page<Booking> findByUserId(UUID userId, Pageable pageable);

    Page<Booking> findByStatus(String status, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId AND b.status IN ('CONFIRMED', 'PENDING') AND ((b.startTime < :endTime AND b.endTime > :startTime))")
    List<Booking> findConflictingBookings(@Param("resourceId") UUID resourceId,
            @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    long countByStatus(String status);

    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId AND b.status IN ('CONFIRMED', 'PENDING')")
    List<Booking> findByResourceIdAndActiveStatus(@Param("resourceId") UUID resourceId);

    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId AND b.startTime >= :fromDate AND b.endTime <= :toDate AND b.status = 'CONFIRMED'")
    List<Booking> findByResourceIdAndDateRange(@Param("resourceId") UUID resourceId, @Param("fromDate") String fromDate,
            @Param("toDate") String toDate);
}
