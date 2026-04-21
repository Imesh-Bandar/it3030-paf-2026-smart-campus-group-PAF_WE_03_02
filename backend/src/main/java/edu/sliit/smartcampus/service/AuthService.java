package edu.sliit.smartcampus.service;

import java.time.OffsetDateTime;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.Locale;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import edu.sliit.smartcampus.dto.AuthResponse;
import edu.sliit.smartcampus.dto.LoginRequest;
import edu.sliit.smartcampus.dto.RegisterRequest;
import edu.sliit.smartcampus.dto.UserDto;
import edu.sliit.smartcampus.exception.ConflictException;
import edu.sliit.smartcampus.exception.ResourceNotFoundException;
import edu.sliit.smartcampus.exception.ValidationException;
import edu.sliit.smartcampus.model.RefreshToken;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.model.UserStatus;
import edu.sliit.smartcampus.repository.RefreshTokenRepository;
import edu.sliit.smartcampus.repository.UserRepository;
import edu.sliit.smartcampus.security.JwtTokenProvider;
import edu.sliit.smartcampus.model.SecurityEventType;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final LocalCredentialService localCredentialService;
    private final PasswordEncoder passwordEncoder;
    private final SecurityActivityService securityActivityService;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            JwtTokenProvider jwtTokenProvider,
            LocalCredentialService localCredentialService,
            PasswordEncoder passwordEncoder,
            SecurityActivityService securityActivityService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.localCredentialService = localCredentialService;
        this.passwordEncoder = passwordEncoder;
        this.securityActivityService = securityActivityService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("An account with this email already exists");
        }

        validatePassword(request.password());

        User user = new User();
        user.setEmail(email);
        user.setFullName(request.fullName().trim());
        user.setEmailVerified(false);
        user.setRole(parseSelfRegistrationRole(request.role()));
        user.setStatus(UserStatus.ACTIVE);
        user.setLastLoginAt(OffsetDateTime.now());

        User saved = userRepository.save(user);
        localCredentialService.upsertPasswordHash(saved.getId(), passwordEncoder.encode(request.password()));

        return issueSession(saved);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ValidationException("Invalid email or password"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            securityActivityService.logEvent(user.getId(), SecurityEventType.LOGIN_FAILED, null, null, null,
                    "Account is not active");
            throw new ValidationException("Account is not active");
        }

        String passwordHash = localCredentialService.findPasswordHash(user.getId())
                .orElse(null);
        if (passwordHash == null) {
            securityActivityService.logEvent(user.getId(), SecurityEventType.LOGIN_FAILED, null, null, null,
                    "Google sign-in only");
            throw new ValidationException("This account uses Google sign-in");
        }

        if (!passwordEncoder.matches(request.password(), passwordHash)) {
            securityActivityService.logEvent(user.getId(), SecurityEventType.LOGIN_FAILED, null, null, null,
                    "Invalid password");
            throw new ValidationException("Invalid email or password");
        }

        user.setLastLoginAt(OffsetDateTime.now());
        User saved = userRepository.save(user);
        securityActivityService.logEvent(saved.getId(), SecurityEventType.LOGIN_SUCCESS, null, null, null,
                "Email/password login");
        return issueSession(saved);
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
            user.setRole(UserRole.STUDENT);
        }
        if (user.getStatus() == null) {
            user.setStatus(UserStatus.ACTIVE);
        }
        user.setLastLoginAt(OffsetDateTime.now());

        User saved = userRepository.save(user);
        securityActivityService.logEvent(saved.getId(), SecurityEventType.OAUTH_LOGIN, null, null, null,
                "Google OAuth login");
        return issueSession(saved);
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

        securityActivityService.logEvent(user.getId(), SecurityEventType.TOKEN_REFRESH, null, null, null,
                "Refresh token rotated");

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
            securityActivityService.logEvent(token.getUser().getId(), SecurityEventType.LOGOUT, null, null, null,
                    "User logout");
        });
    }

    public UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Unauthenticated request");
        }
        return UUID.fromString(authentication.getName());
    }

    public List<UserDto> listUsers() {
        return userRepository.findAll().stream().map(this::toUserDto).toList();
    }

    @Transactional
    public UserDto updateUserRole(UUID userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(parseAnyRole(role));
        return toUserDto(userRepository.save(user));
    }

    @Transactional
    public UserDto updateUserStatus(UUID userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(parseStatus(status));
        return toUserDto(userRepository.save(user));
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

    private AuthResponse issueSession(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        revokeActiveUserTokens(user.getId());
        persistRefreshToken(user, refreshToken);

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                3600,
                toUserDto(user));
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ValidationException("Email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private UserRole parseSelfRegistrationRole(String role) {
        UserRole parsedRole = parseAnyRole(role);
        if (parsedRole == UserRole.ADMIN) {
            throw new ValidationException("ADMIN role cannot be self-registered");
        }
        return parsedRole;
    }

    private UserRole parseAnyRole(String role) {
        if (role == null || role.isBlank()) {
            throw new ValidationException("Role is required");
        }

        try {
            return UserRole.valueOf(role.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ValidationException("Invalid role. Allowed values: STUDENT, STAFF, TECHNICIAN, ADMIN");
        }
    }

    private UserStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new ValidationException("Status is required");
        }

        try {
            return UserStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ValidationException("Invalid status. Allowed values: ACTIVE, LOCKED, ARCHIVED");
        }
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new ValidationException("Password must be at least 8 characters");
        }
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
