package edu.sliit.smartcampus.service;

import java.time.OffsetDateTime;
import java.time.Duration;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import edu.sliit.smartcampus.dto.AuthResponse;
import edu.sliit.smartcampus.dto.UserDto;
import edu.sliit.smartcampus.exception.ResourceNotFoundException;
import edu.sliit.smartcampus.model.RefreshToken;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.model.UserStatus;
import edu.sliit.smartcampus.repository.RefreshTokenRepository;
import edu.sliit.smartcampus.repository.UserRepository;
import edu.sliit.smartcampus.security.JwtTokenProvider;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthResponse handleOAuthLogin(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String avatarUrl = oAuth2User.getAttribute("picture");
        String googleId = oAuth2User.getAttribute("sub");
        Boolean verified = oAuth2User.getAttribute("email_verified");

        User user = userRepository.findByEmail(email).orElseGet(User::new);
        user.setEmail(email);
        user.setFullName(name == null ? email : name);
        user.setAvatarUrl(avatarUrl);
        user.setGoogleId(googleId);
        user.setEmailVerified(Boolean.TRUE.equals(verified));
        if (user.getRole() == null) {
            user.setRole(UserRole.USER);
        }
        if (user.getStatus() == null) {
            user.setStatus(UserStatus.ACTIVE);
        }
        user.setLastLoginAt(OffsetDateTime.now());

        User saved = userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(saved);
        String refreshToken = jwtTokenProvider.generateRefreshToken(saved);

        revokeActiveUserTokens(saved.getId());
        persistRefreshToken(saved, refreshToken);

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                3600,
                toUserDto(saved));
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        RefreshToken tokenRecord = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found"));

        if (tokenRecord.isRevoked() || tokenRecord.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Refresh token expired or revoked");
        }

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        User user = tokenRecord.getUser();
        tokenRecord.setRevoked(true);
        tokenRecord.setRevokedAt(OffsetDateTime.now());
        refreshTokenRepository.save(tokenRecord);

        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);
        persistRefreshToken(user, newRefreshToken);

        return new AuthResponse(
                newAccessToken,
                newRefreshToken,
                "Bearer",
                3600,
                toUserDto(user));
    }

    public UserDto getCurrentUser() {
        UUID userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserDto(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(token -> {
            token.setRevoked(true);
            token.setRevokedAt(OffsetDateTime.now());
            refreshTokenRepository.save(token);
        });
    }

    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Unauthenticated request");
        }
        return UUID.fromString(authentication.getName());
    }

    private void revokeActiveUserTokens(UUID userId) {
        refreshTokenRepository.findByUser_IdAndRevokedFalse(userId).forEach(token -> {
            token.setRevoked(true);
            token.setRevokedAt(OffsetDateTime.now());
        });
    }

    private void persistRefreshToken(User user, String token) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(token);
        refreshToken.setRevoked(false);
        refreshToken.setExpiresAt(
                OffsetDateTime.now().plus(Duration.ofMillis(jwtTokenProvider.getRefreshExpirationMillis())));
        refreshTokenRepository.save(refreshToken);
    }

    private UserDto toUserDto(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getAvatarUrl(),
                user.isEmailVerified(),
                user.getStatus().name(),
                user.getCreatedAt());
    }
}
