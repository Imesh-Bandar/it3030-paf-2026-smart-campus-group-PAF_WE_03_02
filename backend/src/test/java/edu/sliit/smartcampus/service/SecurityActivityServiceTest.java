package edu.sliit.smartcampus.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import edu.sliit.smartcampus.model.NotificationType;
import edu.sliit.smartcampus.model.SecurityActivityLog;
import edu.sliit.smartcampus.model.SecurityEventType;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.model.UserStatus;
import edu.sliit.smartcampus.repository.SecurityActivityLogRepository;
import edu.sliit.smartcampus.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class SecurityActivityServiceTest {

    @Mock
    private SecurityActivityLogRepository logRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private SecurityActivityService securityActivityService;

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

        lenient().when(authentication.getName()).thenReturn(testUser.getId().toString());
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void logEvent_savesEntryAndTriggersSecurityNotificationWhenSuspicious() {
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(logRepository.countByUser_IdAndEventType(testUser.getId(), SecurityEventType.LOGIN_FAILED))
                .thenReturn(3L);
        when(logRepository.save(any(SecurityActivityLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        securityActivityService.logEvent(
                testUser.getId(),
                SecurityEventType.LOGIN_SUCCESS,
                "127.0.0.1",
                "JUnit",
                "Colombo",
                "Login successful");

        verify(logRepository).save(any(SecurityActivityLog.class));
        verify(notificationService).createNotification(
                eq(testUser.getId()),
                eq(NotificationType.ACCOUNT_SECURITY_ALERT),
                eq("Suspicious Login Detected"),
                startsWith("A login from an unusual location or device was detected at "),
                eq(null),
                eq("SECURITY"));
    }

    @Test
    void acknowledgeSuspiciousForCurrentUser_returnsUpdatedCount() {
        when(logRepository.acknowledgeSuspiciousByUserId(any(), any())).thenReturn(2);

        int updated = securityActivityService.acknowledgeSuspiciousForCurrentUser();

        assertThat(updated).isEqualTo(2);
    }
}
