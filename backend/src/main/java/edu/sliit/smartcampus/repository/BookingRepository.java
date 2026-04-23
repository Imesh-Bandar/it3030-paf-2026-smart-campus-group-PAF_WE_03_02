package edu.sliit.smartcampus.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import edu.sliit.smartcampus.model.Booking;
import edu.sliit.smartcampus.model.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByBooker_IdOrderByBookingDateDescStartTimeDesc(UUID bookerId);

    List<Booking> findByStatusOrderByCreatedAtAsc(BookingStatus status);

    List<Booking> findByResource_IdAndBookingDateAndStatusOrderByStartTimeAsc(
            UUID resourceId,
            LocalDate bookingDate,
            BookingStatus status);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.resource.id = :resourceId
              AND b.bookingDate = :bookingDate
              AND b.status = 'APPROVED'
              AND b.startTime < :endTime
              AND b.endTime > :startTime
            """)
    List<Booking> findApprovedConflicts(
            @Param("resourceId") UUID resourceId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.resource.id = :resourceId
              AND b.bookingDate = :bookingDate
              AND b.id <> :bookingId
              AND b.status = 'APPROVED'
              AND b.startTime < :endTime
              AND b.endTime > :startTime
            """)
    List<Booking> findApprovedConflictsExcludingBooking(
            @Param("resourceId") UUID resourceId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("bookingId") UUID bookingId);

    List<Booking> findByResource_IdAndBookingDateOrderByStartTimeAsc(UUID resourceId, LocalDate bookingDate);
}
