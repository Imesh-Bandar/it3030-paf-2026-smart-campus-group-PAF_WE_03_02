package edu.sliit.smartcampus.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import edu.sliit.smartcampus.model.WaitlistEntry;
import edu.sliit.smartcampus.model.WaitlistStatus;

public interface WaitlistEntryRepository extends JpaRepository<WaitlistEntry, UUID> {
    Optional<WaitlistEntry> findByBooking_Id(UUID bookingId);

    @Query("""
            SELECT COALESCE(MAX(w.position), 0)
            FROM WaitlistEntry w
            WHERE w.booking.resource.id = :resourceId
              AND w.booking.bookingDate = :bookingDate
              AND w.booking.startTime = :startTime
              AND w.booking.endTime = :endTime
              AND w.status = 'WAITING'
            """)
    int findMaxPositionForSlot(
            @Param("resourceId") UUID resourceId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    @Query("""
            SELECT w FROM WaitlistEntry w
            WHERE w.booking.resource.id = :resourceId
              AND w.booking.bookingDate = :bookingDate
              AND w.booking.startTime = :startTime
              AND w.booking.endTime = :endTime
              AND w.status = :status
            ORDER BY w.position ASC, w.createdAt ASC
            """)
    List<WaitlistEntry> findBySlotAndStatusOrdered(
            @Param("resourceId") UUID resourceId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("status") WaitlistStatus status);
}
