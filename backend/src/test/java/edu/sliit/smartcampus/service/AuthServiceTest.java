package edu.sliit.smartcampus.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import edu.sliit.smartcampus.dto.AuthResponse;
import edu.sliit.smartcampus.dto.LoginRequest;
import edu.sliit.smartcampus.model.RefreshToken;
import edu.sliit.smartcampus.model.SecurityEventType;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.model.UserStatus;
import edu.sliit.smartcampus.repository.RefreshTokenRepository;
import edu.sliit.smartcampus.repository.UserRepository;
import edu.sliit.smartcampus.security.JwtTokenProvider;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private LocalCredentialService localCredentialService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SecurityActivityService securityActivityService;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("student@smartcampus.edu");
        testUser.setFullName("Test Student");
        testUser.setRole(UserRole.STUDENT);
        testUser.setStatus(UserStatus.ACTIVE);
        testUser.setEmailVerified(true);
    }

    @Test
    void login_successIssuesSessionAndLogsEvent() {
        when(userRepository.findByEmail("student@smartcampus.edu")).thenReturn(Optional.of(testUser));
        when(localCredentialService.findPasswordHash(testUser.getId())).thenReturn(Optional.of("hashed"));
        when(passwordEncoder.matches("secret123", "hashed")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtTokenProvider.generateAccessToken(testUser)).thenReturn("access-token");
        when(jwtTokenProvider.generateRefreshToken(testUser)).thenReturn("refresh-token");
        when(jwtTokenProvider.getRefreshExpirationMillis()).thenReturn(3_600_000L);

        AuthResponse response = authService.login(new LoginRequest("student@smartcampus.edu", "secret123"));

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
        verify(securityActivityService).logEvent(
                testUser.getId(), SecurityEventType.LOGIN_SUCCESS, null, null, null, "Email/password login");
    }

    @Test
    void login_invalidPasswordLogsFailureAndThrows() {
        when(userRepository.findByEmail("student@smartcampus.edu")).thenReturn(Optional.of(testUser));
        when(localCredentialService.findPasswordHash(testUser.getId())).thenReturn(Optional.of("hashed"));
        when(passwordEncoder.matches("wrong-pass", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("student@smartcampus.edu", "wrong-pass")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid email or password");

        verify(securityActivityService).logEvent(
                testUser.getId(), SecurityEventType.LOGIN_FAILED, null, null, null, "Invalid password");
    }

    @Test
    void logout_revokesTokenAndLogsSecurityEvent() {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(testUser);
        refreshToken.setToken("refresh-token");
        refreshToken.setRevoked(false);
        refreshToken.setExpiresAt(OffsetDateTime.now().plusDays(1));

        when(refreshTokenRepository.findByToken("refresh-token")).thenReturn(Optional.of(refreshToken));

        authService.logout("refresh-token");

        assertThat(refreshToken.isRevoked()).isTrue();
        verify(refreshTokenRepository).save(refreshToken);
        verify(securityActivityService).logEvent(
                testUser.getId(), SecurityEventType.LOGOUT, null, null, null, "User logout");
    }
}
