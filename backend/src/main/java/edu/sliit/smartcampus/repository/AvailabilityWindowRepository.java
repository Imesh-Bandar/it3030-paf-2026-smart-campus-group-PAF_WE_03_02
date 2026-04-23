package edu.sliit.smartcampus.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import edu.sliit.smartcampus.model.AvailabilityWindow;

public interface AvailabilityWindowRepository extends JpaRepository<AvailabilityWindow, UUID> {
    List<AvailabilityWindow> findByResource_IdOrderByDayOfWeekAscStartTimeAsc(UUID resourceId);

    void deleteByResource_Id(UUID resourceId);
}
