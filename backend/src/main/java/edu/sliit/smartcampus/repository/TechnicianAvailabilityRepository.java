package edu.sliit.smartcampus.repository;

import edu.sliit.smartcampus.model.TechnicianAvailability;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TechnicianAvailabilityRepository extends JpaRepository<TechnicianAvailability, UUID> {
    Optional<TechnicianAvailability> findByTechnician_Id(UUID technicianId);

    List<TechnicianAvailability> findByTechnician_IdIn(List<UUID> technicianIds);
}
