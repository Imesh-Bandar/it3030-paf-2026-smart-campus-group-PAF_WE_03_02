package edu.sliit.smartcampus.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import edu.sliit.smartcampus.dto.TicketCommentRequestDto;
import edu.sliit.smartcampus.dto.TicketCreateRequestDto;
import edu.sliit.smartcampus.dto.TicketStatusUpdateRequestDto;
import edu.sliit.smartcampus.model.Ticket;
import edu.sliit.smartcampus.model.TicketCategory;
import edu.sliit.smartcampus.model.TicketPriority;
import edu.sliit.smartcampus.model.TicketStatus;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.repository.TicketAttachmentRepository;
import edu.sliit.smartcampus.repository.TicketCommentRepository;
import edu.sliit.smartcampus.repository.TicketRepository;
import edu.sliit.smartcampus.repository.UserRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {
    @Mock
    private AuthService authService;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private TicketCommentRepository commentRepository;
    @Mock
    private TicketAttachmentRepository attachmentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TicketFileStorageService fileStorageService;
    @Mock
    private NotificationService notificationService;

    private TicketService ticketService;
    private User student;
    private User admin;
    private User technician;

    @BeforeEach
    void setUp() {
        ticketService = new TicketService(authService, ticketRepository, commentRepository, attachmentRepository,
                userRepository, fileStorageService, notificationService);
        student = user("Student", UserRole.STUDENT);
        admin = user("Admin", UserRole.ADMIN);
        technician = user("Tech", UserRole.TECHNICIAN);
    }

    @Test
    void createTicket_setsDefaultsAndReporter() {
        when(authService.getCurrentUserId()).thenReturn(student.getId());
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(ticketRepository.findMaxTicketNumberForPrefix(any())).thenReturn("");
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findByRole(UserRole.ADMIN)).thenReturn(List.of(admin));

        TicketCreateRequestDto request = new TicketCreateRequestDto();
        request.setTitle("Broken projector");
        request.setDescription("Projector does not power on");
        request.setCategory("IT_EQUIPMENT");
        request.setPriority("HIGH");
        request.setLocation("Lab A");
        request.setFiles(List.of());

        var result = ticketService.createTicket(request);

        assertThat(result.status()).isEqualTo("OPEN");
        assertThat(result.ticketNumber()).startsWith("TCK-");
        assertThat(result.reporterId()).isEqualTo(student.getId());
        verify(notificationService).createNotification(any(), any(), any(), any(), any(), any());
    }

    @Test
    void listTickets_scopesStudentToOwnTickets() {
        Ticket ticket = ticket("TCK-1", student, null);
        when(authService.getCurrentUserId()).thenReturn(student.getId());
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(ticketRepository.search(null, null, student.getId())).thenReturn(List.of(ticket));

        var result = ticketService.listTickets(null, technician.getId(), admin.getId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).reporterId()).isEqualTo(student.getId());
    }

    @Test
    void assignTicket_requiresTechnicianRole() {
        User staff = user("Staff", UserRole.STAFF);
        when(authService.getCurrentUserId()).thenReturn(admin.getId());
        when(userRepository.findById(admin.getId())).thenReturn(Optional.of(admin));
        when(ticketRepository.findById(any())).thenReturn(Optional.of(ticket("TCK-2", student, null)));
        when(userRepository.findById(staff.getId())).thenReturn(Optional.of(staff));

        assertThatThrownBy(() -> ticketService.assignTicket(UUID.randomUUID(), staff.getId()))
                .hasMessageContaining("not a technician");
    }

    @Test
    void updateStatus_setsResolvedTimestamp() {
        Ticket ticket = ticket("TCK-3", student, technician);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        when(authService.getCurrentUserId()).thenReturn(technician.getId());
        when(userRepository.findById(technician.getId())).thenReturn(Optional.of(technician));
        when(ticketRepository.findById(ticket.getId())).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(attachmentRepository.findByTicket_IdOrderByCreatedAtAsc(ticket.getId())).thenReturn(List.of());
        when(commentRepository.findByTicket_IdAndDeletedAtIsNullOrderByCreatedAtAsc(ticket.getId())).thenReturn(List.of());

        var result = ticketService.updateStatus(ticket.getId(), new TicketStatusUpdateRequestDto("RESOLVED", null));

        assertThat(result.status()).isEqualTo("RESOLVED");
        assertThat(result.resolvedAt()).isNotNull();
    }

    @Test
    void addComment_rejectsInternalNoteFromStudent() {
        Ticket ticket = ticket("TCK-4", student, technician);
        when(authService.getCurrentUserId()).thenReturn(student.getId());
        when(userRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(ticketRepository.findById(ticket.getId())).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.addComment(ticket.getId(), new TicketCommentRequestDto("hidden", true)))
                .isInstanceOf(AccessDeniedException.class);
    }

    private User user(String name, UserRole role) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setFullName(name);
        user.setEmail(name.toLowerCase() + "@example.com");
        user.setRole(role);
        return user;
    }

    private Ticket ticket(String number, User reporter, User assignee) {
        Ticket ticket = new Ticket();
        ticket.setId(UUID.randomUUID());
        ticket.setTicketNumber(number);
        ticket.setTitle("Issue");
        ticket.setDescription("Description");
        ticket.setCategory(TicketCategory.OTHER);
        ticket.setPriority(TicketPriority.MEDIUM);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setReporter(reporter);
        ticket.setAssignee(assignee);
        ticket.setCreatedAt(OffsetDateTime.now().minusHours(1));
        ticket.setUpdatedAt(OffsetDateTime.now());
        return ticket;
    }
}
