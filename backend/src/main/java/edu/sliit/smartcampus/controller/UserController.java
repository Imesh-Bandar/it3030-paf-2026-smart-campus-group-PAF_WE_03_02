package edu.sliit.smartcampus.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import edu.sliit.smartcampus.dto.UserDto;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.repository.UserRepository;

@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> listUsers(@RequestParam(required = false) UserRole role) {
        List<UserDto> users = (role == null ? userRepository.findAll() : userRepository.findAllByRole(role))
                .stream()
                .map(user -> new UserDto(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getRole().name(),
                        user.getAvatarUrl(),
                        user.isEmailVerified(),
                        user.getStatus().name(),
                        user.getCreatedAt()))
                .toList();

        return ResponseEntity.ok(users);
    }
}