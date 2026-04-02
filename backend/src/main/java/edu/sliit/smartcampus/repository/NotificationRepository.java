package edu.sliit.smartcampus.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import edu.sliit.smartcampus.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
}
