package edu.sliit.smartcampus.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserDto(
        UUID id,
        String email,
        String fullName,
        String role,
        String avatarUrl,
        boolean emailVerified,
        String status,
        OffsetDateTime createdAt) {
}
