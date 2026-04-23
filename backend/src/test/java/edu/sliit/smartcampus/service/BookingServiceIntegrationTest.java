package edu.sliit.smartcampus.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import edu.sliit.smartcampus.dto.BookingActionRequestDto;
import edu.sliit.smartcampus.dto.BookingRequestDto;
import edu.sliit.smartcampus.model.BookingStatus;
import edu.sliit.smartcampus.model.Resource;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.model.UserStatus;
import edu.sliit.smartcampus.repository.UserRepository;
import edu.sliit.smartcampus.repository.ResourceRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BookingServiceIntegrationTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @MockBean
    private AuthService authService;

    @MockBean
    private NotificationService notificationService;

    private User bookerA;
    private User bookerB;
    private User admin;
    private Resource resource;

    @BeforeEach
    void setUp() {
        bookerA = createUser("booker-a@smartcampus.edu", "Booker A", UserRole.STUDENT);
        bookerB = createUser("booker-b@smartcampus.edu", "Booker B", UserRole.STUDENT);
        admin = createUser("admin@smartcampus.edu", "Admin", UserRole.ADMIN);

        resource = new Resource();
        resource.setId(UUID.randomUUID());
        resource.setName("Engineering Lab");
        resourceRepository.save(resource);
    }

    @Test
    void approvalWorkflow_createsAndApprovesPendingBooking() {
        BookingRequestDto request = new BookingRequestDto(
                resource.getId(),
                LocalDate.now().plusDays(1),
                LocalTime.of(10, 0),
                LocalTime.of(11, 0),
                "Class session");

        when(authService.getCurrentUserId()).thenReturn(bookerA.getId());
        var created = bookingService.createBooking(request);

        when(authService.getCurrentUserId()).thenReturn(admin.getId());
        var approved = bookingService.approveBooking(created.id());

        assertThat(created.status()).isEqualTo(BookingStatus.PENDING.name());
        assertThat(approved.status()).isEqualTo(BookingStatus.APPROVED.name());
        assertThat(approved.qrToken()).isNotBlank();
    }

    @Test
    void cancelApprovedBooking_autoPromotesWaitlistedBooking() {
        BookingRequestDto firstRequest = new BookingRequestDto(
                resource.getId(),
                LocalDate.now().plusDays(1),
                LocalTime.of(12, 0),
                LocalTime.of(13, 0),
                "Team meeting");

        BookingRequestDto secondRequest = new BookingRequestDto(
                resource.getId(),
                LocalDate.now().plusDays(1),
                LocalTime.of(12, 0),
                LocalTime.of(13, 0),
                "Overflow request");

        when(authService.getCurrentUserId()).thenReturn(bookerA.getId());
        var first = bookingService.createBooking(firstRequest);

        when(authService.getCurrentUserId()).thenReturn(admin.getId());
        var firstApproved = bookingService.approveBooking(first.id());
        assertThat(firstApproved.status()).isEqualTo(BookingStatus.APPROVED.name());

        when(authService.getCurrentUserId()).thenReturn(bookerB.getId());
        var second = bookingService.createBooking(secondRequest);
        assertThat(second.waitlisted()).isTrue();

        when(authService.getCurrentUserId()).thenReturn(admin.getId());
        bookingService.cancelBooking(first.id(), new BookingActionRequestDto("Cancelled by admin"));

        when(authService.getCurrentUserId()).thenReturn(bookerB.getId());
        var promoted = bookingService.getBooking(second.id());
        assertThat(promoted.status()).isEqualTo(BookingStatus.APPROVED.name());
        assertThat(promoted.qrToken()).isNotBlank();
    }

    @Test
    void approvingSecondOverlappingPendingBooking_isBlocked() {
        BookingRequestDto firstRequest = new BookingRequestDto(
                resource.getId(),
                LocalDate.now().plusDays(2),
                LocalTime.of(9, 0),
                LocalTime.of(10, 0),
                "Morning session");

        BookingRequestDto secondRequest = new BookingRequestDto(
                resource.getId(),
                LocalDate.now().plusDays(2),
                LocalTime.of(9, 30),
                LocalTime.of(10, 30),
                "Overlapping session");

        when(authService.getCurrentUserId()).thenReturn(bookerA.getId());
        var first = bookingService.createBooking(firstRequest);

        when(authService.getCurrentUserId()).thenReturn(bookerB.getId());
        var second = bookingService.createBooking(secondRequest);

        when(authService.getCurrentUserId()).thenReturn(admin.getId());
        var approved = bookingService.approveBooking(first.id());

        assertThat(approved.status()).isEqualTo(BookingStatus.APPROVED.name());
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> bookingService.approveBooking(second.id()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("slot is already reserved");
    }

    private User createUser(String email, String fullName, UserRole role) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        user.setFullName(fullName);
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);
        return userRepository.save(user);
    }
}
