package edu.sliit.smartcampus.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import edu.sliit.smartcampus.model.Notification;
import edu.sliit.smartcampus.model.NotificationType;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.model.UserStatus;
import edu.sliit.smartcampus.repository.NotificationPreferenceRepository;
import edu.sliit.smartcampus.repository.NotificationRepository;
import edu.sliit.smartcampus.repository.UserRepository;

import java.util.List;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationPreferenceRepository preferenceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private NotificationService notificationService;

    private UUID userId;
    private User testUser;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");
        testUser.setRole(UserRole.STUDENT);
        testUser.setStatus(UserStatus.ACTIVE);
        testUser.setEmailVerified(true);

        lenient().when(authentication.getName()).thenReturn(userId.toString());
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void getNotificationsForCurrentUser_returnsPageOfDtos() {
        Notification n = buildNotification();
        when(notificationRepository.findByUser_IdOrderByCreatedAtDesc(any(), any()))
                .thenReturn(new PageImpl<>(List.of(n)));

        var result = notificationService.getNotificationsForCurrentUser(PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).title()).isEqualTo("Test Notification");
    }

    @Test
    void markAsRead_setsReadAndReadAt() {
        Notification n = buildNotification();
        UUID notifId = n.getId();
        when(notificationRepository.findById(notifId)).thenReturn(Optional.of(n));
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var dto = notificationService.markAsRead(notifId);

        assertThat(dto.read()).isTrue();
        assertThat(dto.readAt()).isNotNull();
    }

    @Test
    void markAsRead_throwsWhenNotificationBelongsToAnotherUser() {
        Notification n = buildNotification();
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        n.setUser(otherUser);

        when(notificationRepository.findById(n.getId())).thenReturn(Optional.of(n));

        assertThatThrownBy(() -> notificationService.markAsRead(n.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Access denied");
    }

    @Test
    void getUnreadCount_returnsCorrectCount() {
        when(notificationRepository.countByUser_IdAndReadFalse(userId)).thenReturn(5L);

        long count = notificationService.getUnreadCount();

        assertThat(count).isEqualTo(5L);
    }

    @Test
    void deleteNotification_deletesWhenOwner() {
        Notification n = buildNotification();
        when(notificationRepository.findById(n.getId())).thenReturn(Optional.of(n));

        notificationService.deleteNotification(n.getId());

        verify(notificationRepository).delete(n);
    }

    @Test
    void createNotification_savesWhenNoPreferenceExists() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(preferenceRepository.findByUser_Id(userId)).thenReturn(Optional.empty());
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificationService.createNotification(userId, NotificationType.GENERAL,
                "Hello", "World", null, null);

        verify(notificationRepository).save(any(Notification.class));
    }

    private Notification buildNotification() {
        Notification n = new Notification();
        n.setId(UUID.randomUUID());
        n.setUser(testUser);
        n.setType(NotificationType.GENERAL);
        n.setTitle("Test Notification");
        n.setMessage("This is a test");
        n.setRead(false);
        n.setCreatedAt(OffsetDateTime.now());
        return n;
    }
}
