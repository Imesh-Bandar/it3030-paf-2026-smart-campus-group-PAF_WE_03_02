package edu.sliit.smartcampus.service;

import java.util.UUID;
import org.springframework.stereotype.Service;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.repository.UserRepository;

@Service
public class TicketService {

    private final AuthService authService;
    private final UserRepository userRepository;

    public TicketService(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    public boolean canViewTicket(UUID reporterId, UUID assignedTechnicianId) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() == UserRole.ADMIN) {
            return true;
        }
        if (currentUser.getId().equals(reporterId)) {
            return true;
        }
        return assignedTechnicianId != null && currentUser.getId().equals(assignedTechnicianId);
    }

    private User getCurrentUser() {
        UUID currentUserId = authService.getCurrentUserId();
        return userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }
}
