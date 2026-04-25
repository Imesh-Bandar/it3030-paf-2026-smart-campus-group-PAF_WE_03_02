package edu.sliit.smartcampus.service;

import java.util.UUID;
import org.springframework.stereotype.Service;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.repository.UserRepository;

@Service
public class BookingService {

    private final AuthService authService;
    private final UserRepository userRepository;

    public BookingService(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    public boolean canCancelBooking(UUID bookingOwnerId) {
        User currentUser = getCurrentUser();
        return currentUser.getRole() == UserRole.ADMIN || currentUser.getId().equals(bookingOwnerId);
    }

    private User getCurrentUser() {
        UUID currentUserId = authService.getCurrentUserId();
        return userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
    }
}
