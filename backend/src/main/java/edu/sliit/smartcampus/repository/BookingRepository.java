package edu.sliit.smartcampus.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import edu.sliit.smartcampus.model.Booking;
import edu.sliit.smartcampus.model.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByResource_IdAndBookingDateBetweenAndStatusInOrderByBookingDateAscStartTimeAsc(
            UUID resourceId,
            LocalDate from,
            LocalDate to,
            List<BookingStatus> statuses);

    boolean existsByResource_IdAndStatusIn(UUID resourceId, List<BookingStatus> statuses);
}
