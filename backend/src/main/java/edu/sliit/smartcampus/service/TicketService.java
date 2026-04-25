package edu.sliit.smartcampus.service;

import edu.sliit.smartcampus.dto.AssignmentSuggestionDto;
import edu.sliit.smartcampus.dto.TechnicianAvailabilityDto;
import edu.sliit.smartcampus.dto.TechnicianAvailabilityUpdateRequestDto;
import edu.sliit.smartcampus.dto.TechnicianWorkloadDto;
import edu.sliit.smartcampus.dto.TicketAttachmentDto;
import edu.sliit.smartcampus.dto.TicketCommentDto;
import edu.sliit.smartcampus.dto.TicketCommentRequestDto;
import edu.sliit.smartcampus.dto.TicketCreateRequestDto;
import edu.sliit.smartcampus.dto.TicketDto;
import edu.sliit.smartcampus.dto.TicketSlaMetricsDto;
import edu.sliit.smartcampus.dto.TicketStatusUpdateRequestDto;
import edu.sliit.smartcampus.exception.ResourceNotFoundException;
import edu.sliit.smartcampus.exception.ValidationException;
import edu.sliit.smartcampus.model.NotificationType;
import edu.sliit.smartcampus.model.TechnicianAvailability;
import edu.sliit.smartcampus.model.Ticket;
import edu.sliit.smartcampus.model.TicketAttachment;
import edu.sliit.smartcampus.model.TicketCategory;
import edu.sliit.smartcampus.model.TicketComment;
import edu.sliit.smartcampus.model.TicketPriority;
import edu.sliit.smartcampus.model.TicketStatus;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.repository.TicketAttachmentRepository;
import edu.sliit.smartcampus.repository.TicketCommentRepository;
import edu.sliit.smartcampus.repository.TicketRepository;
import edu.sliit.smartcampus.repository.TechnicianAvailabilityRepository;
import edu.sliit.smartcampus.repository.UserRepository;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.HashMap;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class TicketService {
    private static final List<TicketStatus> ACTIVE_STATUSES = List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS);
    private static final Duration RESPONSE_SLA = Duration.ofHours(8);
    private static final Map<TicketPriority, Duration> RESOLUTION_SLA = Map.of(
            TicketPriority.LOW, Duration.ofDays(5),
            TicketPriority.MEDIUM, Duration.ofDays(3),
            TicketPriority.HIGH, Duration.ofDays(1),
            TicketPriority.CRITICAL, Duration.ofHours(6));

    private final AuthService authService;
    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TechnicianAvailabilityRepository technicianAvailabilityRepository;
    private final UserRepository userRepository;
    private final TicketFileStorageService fileStorageService;
    private final NotificationService notificationService;

    public TicketService(
            AuthService authService,
            TicketRepository ticketRepository,
            TicketCommentRepository commentRepository,
            TicketAttachmentRepository attachmentRepository,
            TechnicianAvailabilityRepository technicianAvailabilityRepository,
            UserRepository userRepository,
            TicketFileStorageService fileStorageService,
            NotificationService notificationService) {
        this.authService = authService;
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.attachmentRepository = attachmentRepository;
        this.technicianAvailabilityRepository = technicianAvailabilityRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
    }

    @Transactional
    public TicketDto createTicket(TicketCreateRequestDto request) {
        User reporter = getCurrentUser();
        List<MultipartFile> attachments = request.getFiles() == null ? List.of() : request.getFiles().stream()
                .filter(file -> file != null && !file.isEmpty())
                .toList();
        if (attachments.size() > fileStorageService.maxFiles()) {
            throw new ValidationException("A ticket can include at most 3 image attachments");
        }

        Ticket ticket = new Ticket();
        ticket.setTicketNumber(nextTicketNumber());
        ticket.setTitle(required(request.getTitle(), "Title"));
        ticket.setDescription(required(request.getDescription(), "Description"));
        ticket.setCategory(parseEnum(TicketCategory.class, request.getCategory(), TicketCategory.OTHER));
        ticket.setPriority(parseEnum(TicketPriority.class, request.getPriority(), null));
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setLocation(blankToNull(request.getLocation()));
        ticket.setReporter(reporter);
        updateSlaState(ticket, OffsetDateTime.now());

        Ticket saved = ticketRepository.save(ticket);
        attachments.forEach(file -> saved.getAttachments().add(fileStorageService.store(saved, reporter, file)));
        Ticket stored = ticketRepository.save(saved);
        notifyAdmins(NotificationType.TICKET_CREATED, "New ticket: " + stored.getTitle(),
                stored.getTicketNumber() + " was reported by " + reporter.getFullName(), stored.getId());
        return toDto(stored, true);
    }

    public List<TicketDto> listTickets(TicketStatus status, UUID assigneeId, UUID reporterId) {
        User current = getCurrentUser();
        UUID scopedReporter = reporterId;
        UUID scopedAssignee = assigneeId;
        if (current.getRole() == UserRole.STUDENT || current.getRole() == UserRole.STAFF) {
            scopedReporter = current.getId();
            scopedAssignee = null;
        } else if (current.getRole() == UserRole.TECHNICIAN) {
            scopedAssignee = current.getId();
            scopedReporter = null;
        }
        return ticketRepository.search(status, scopedAssignee, scopedReporter)
                .stream()
                .peek(ticket -> updateSlaState(ticket, OffsetDateTime.now()))
                .map(ticket -> toDto(ticket, false))
                .toList();
    }

    public TicketDto getTicket(UUID id) {
        Ticket ticket = getVisibleTicket(id);
        updateSlaState(ticket, OffsetDateTime.now());
        return toDto(ticket, true);
    }

    @Transactional
    public TicketDto assignTicket(UUID ticketId, UUID technicianId) {
        User current = getCurrentUser();
        requireAdmin(current);
        Ticket ticket = getActiveTicket(ticketId);
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));
        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new ValidationException("Selected user is not a technician");
        }
        if (!isTechnicianAvailable(technician.getId())) {
            throw new ValidationException("Selected technician is currently unavailable");
        }
        ticket.setAssignee(technician);
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        if (ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(OffsetDateTime.now());
        }
        updateSlaState(ticket, OffsetDateTime.now());
        Ticket saved = ticketRepository.save(ticket);
        notificationService.createNotification(technician.getId(), NotificationType.TICKET_ASSIGNED,
                "Ticket assigned", saved.getTicketNumber() + " needs your attention", saved.getId(), "TICKET");
        return toDto(saved, true);
    }

    @Transactional
    public TicketDto updateStatus(UUID ticketId, TicketStatusUpdateRequestDto request) {
        User current = getCurrentUser();
        if (current.getRole() != UserRole.ADMIN && current.getRole() != UserRole.TECHNICIAN) {
            throw new AccessDeniedException("Only admins and technicians can update ticket status");
        }
        Ticket ticket = getActiveTicket(ticketId);
        if (current.getRole() == UserRole.TECHNICIAN && !isAssignedTo(ticket, current)) {
            throw new AccessDeniedException("Technicians can update only assigned tickets");
        }

        TicketStatus next = parseEnum(TicketStatus.class, request.status(), null);
        if (next == null) {
            throw new ValidationException("Invalid ticket status");
        }
        ensureSupportedStatus(next);
        ensureValidStatusTransition(ticket.getStatus(), next);
        OffsetDateTime now = OffsetDateTime.now();
        ticket.setStatus(next);
        if (ticket.getFirstResponseAt() == null && next == TicketStatus.IN_PROGRESS) {
            ticket.setFirstResponseAt(now);
        }
        if (next == TicketStatus.RESOLVED && ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(now);
        }
        updateSlaState(ticket, now);
        Ticket saved = ticketRepository.save(ticket);
        notifyReporter(saved, NotificationType.TICKET_STATUS_UPDATED, "Ticket status updated",
                saved.getTicketNumber() + " is now " + saved.getStatus());
        return toDto(saved, true);
    }

    @Transactional
    public void deleteTicket(UUID ticketId) {
        User current = getCurrentUser();
        Ticket ticket = getActiveTicket(ticketId);
        if (current.getRole() != UserRole.ADMIN && !Objects.equals(ticket.getReporter().getId(), current.getId())) {
            throw new AccessDeniedException("You cannot delete this ticket");
        }
        ticket.setDeletedAt(OffsetDateTime.now());
        ticketRepository.save(ticket);
    }

    @Transactional
    public TicketCommentDto addComment(UUID ticketId, TicketCommentRequestDto request) {
        User current = getCurrentUser();
        Ticket ticket = getVisibleTicket(ticketId);
        boolean internal = Boolean.TRUE.equals(request.internal());
        if (internal && current.getRole() != UserRole.ADMIN && current.getRole() != UserRole.TECHNICIAN) {
            throw new AccessDeniedException("Only admins and technicians can add internal notes");
        }
        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setAuthor(current);
        comment.setContent(required(request.content(), "Comment"));
        comment.setInternal(internal);
        TicketComment saved = commentRepository.save(comment);
        if (!internal) {
            notifyParticipants(ticket, current.getId(), saved.getId());
        }
        return toCommentDto(saved);
    }

    @Transactional
    public TicketCommentDto updateComment(UUID ticketId, UUID commentId, TicketCommentRequestDto request) {
        User current = getCurrentUser();
        TicketComment comment = getEditableComment(ticketId, commentId, current);
        comment.setContent(required(request.content(), "Comment"));
        if (request.internal() != null && (current.getRole() == UserRole.ADMIN || current.getRole() == UserRole.TECHNICIAN)) {
            comment.setInternal(request.internal());
        }
        return toCommentDto(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(UUID ticketId, UUID commentId) {
        User current = getCurrentUser();
        TicketComment comment = getEditableComment(ticketId, commentId, current);
        comment.setDeletedAt(OffsetDateTime.now());
        commentRepository.save(comment);
    }

    public List<TicketAttachmentDto> listAttachments(UUID ticketId) {
        getVisibleTicket(ticketId);
        return attachmentRepository.findByTicket_IdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::toAttachmentDto)
                .toList();
    }

    public TicketSlaMetricsDto getSlaMetrics() {
        requireAdmin(getCurrentUser());
        OffsetDateTime since = OffsetDateTime.now().minusDays(30);
        List<Ticket> tickets = ticketRepository.findByDeletedAtIsNullOrderByCreatedAtDesc();
        long open = tickets.stream().filter(ticket -> ticket.getStatus() == TicketStatus.OPEN).count();
        long progress = tickets.stream().filter(ticket -> ticket.getStatus() == TicketStatus.IN_PROGRESS).count();
        long resolved = tickets.stream().filter(ticket -> ticket.getStatus() == TicketStatus.RESOLVED).count();
        long breached = tickets.stream().filter(Ticket::isSlaBreached).count();
        double avgResponse = averageMinutes(tickets.stream()
                .filter(ticket -> ticket.getFirstResponseAt() != null && ticket.getCreatedAt().isAfter(since))
                .map(ticket -> Duration.between(ticket.getCreatedAt(), ticket.getFirstResponseAt()))
                .toList());
        double avgResolution = averageMinutes(tickets.stream()
                .filter(ticket -> ticket.getResolvedAt() != null && ticket.getCreatedAt().isAfter(since))
                .map(ticket -> Duration.between(ticket.getCreatedAt(), ticket.getResolvedAt()))
                .toList());
        return new TicketSlaMetricsDto(open, progress, resolved, breached, avgResponse, avgResolution, priorityMix(tickets));
    }

    public List<TechnicianWorkloadDto> getTechnicianWorkloads() {
        requireAdmin(getCurrentUser());
        List<User> technicians = userRepository.findByRole(UserRole.TECHNICIAN);
        Map<UUID, TechnicianAvailability> availabilityByTechnician = availabilityByTechnician(technicians);
        return technicians.stream()
                .map(technician -> toWorkloadDto(technician, availabilityByTechnician.get(technician.getId())))
                .sorted(Comparator.comparing(TechnicianWorkloadDto::available).reversed()
                        .thenComparingLong(TechnicianWorkloadDto::activeTickets)
                        .thenComparing(TechnicianWorkloadDto::technicianName))
                .toList();
    }

    public AssignmentSuggestionDto suggestAssignee(UUID ticketId) {
        requireAdmin(getCurrentUser());
        Ticket ticket = getActiveTicket(ticketId);
        List<TechnicianWorkloadDto> workloads = getTechnicianWorkloads();
        TechnicianWorkloadDto suggested = workloads.stream().filter(TechnicianWorkloadDto::available).findFirst().orElse(null);
        if (suggested == null) {
            return new AssignmentSuggestionDto(ticket.getId(), null, null,
                    "No available technicians right now", workloads);
        }
        String reason = "Lowest active load with " + suggested.activeTickets() + " active ticket"
                + (suggested.activeTickets() == 1 ? "" : "s");
        return new AssignmentSuggestionDto(ticket.getId(), suggested.technicianId(), suggested.technicianName(), reason,
                workloads);
    }

    @Transactional
    public TechnicianAvailabilityDto updateMyAvailability(TechnicianAvailabilityUpdateRequestDto request) {
        User technician = getCurrentUser();
        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new AccessDeniedException("Only technicians can update availability");
        }
        TechnicianAvailability availability = technicianAvailabilityRepository.findByTechnician_Id(technician.getId())
                .orElseGet(() -> {
                    TechnicianAvailability created = new TechnicianAvailability();
                    created.setTechnician(technician);
                    return created;
                });
        availability.setAvailable(Boolean.TRUE.equals(request.available()));
        availability.setNote(blankToNull(request.note()));
        TechnicianAvailability saved = technicianAvailabilityRepository.save(availability);
        return toAvailabilityDto(technician, saved);
    }

    public TechnicianAvailabilityDto getMyAvailability() {
        User technician = getCurrentUser();
        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new AccessDeniedException("Only technicians can view availability");
        }
        TechnicianAvailability availability = technicianAvailabilityRepository.findByTechnician_Id(technician.getId())
                .orElse(null);
        return toAvailabilityDto(technician, availability);
    }

    private Ticket getVisibleTicket(UUID id) {
        Ticket ticket = getActiveTicket(id);
        User current = getCurrentUser();
        if (current.getRole() == UserRole.ADMIN) {
            return ticket;
        }
        if (ticket.getReporter() != null && ticket.getReporter().getId().equals(current.getId())) {
            return ticket;
        }
        if (isAssignedTo(ticket, current)) {
            return ticket;
        }
        throw new AccessDeniedException("You cannot view this ticket");
    }

    private Ticket getActiveTicket(UUID id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        if (ticket.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Ticket not found");
        }
        return ticket;
    }

    private TicketComment getEditableComment(UUID ticketId, UUID commentId, User current) {
        getVisibleTicket(ticketId);
        TicketComment comment = commentRepository.findByIdAndTicket_IdAndDeletedAtIsNull(commentId, ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        if (current.getRole() == UserRole.ADMIN) {
            return comment;
        }
        if (comment.getAuthor() != null && comment.getAuthor().getId().equals(current.getId())) {
            return comment;
        }
        throw new AccessDeniedException("You cannot edit this comment");
    }

    private User getCurrentUser() {
        UUID currentUserId = authService.getCurrentUserId();
        return userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private boolean isAssignedTo(Ticket ticket, User user) {
        return ticket.getAssignee() != null && ticket.getAssignee().getId().equals(user.getId());
    }

    private void ensureSupportedStatus(TicketStatus status) {
        if (status != TicketStatus.OPEN && status != TicketStatus.IN_PROGRESS && status != TicketStatus.RESOLVED) {
            throw new ValidationException("Status must be one of OPEN, IN_PROGRESS, RESOLVED");
        }
    }

    private void ensureValidStatusTransition(TicketStatus current, TicketStatus next) {
        if (current == next) {
            return;
        }
        if (current == TicketStatus.OPEN && next == TicketStatus.IN_PROGRESS) {
            return;
        }
        if (current == TicketStatus.IN_PROGRESS && next == TicketStatus.RESOLVED) {
            return;
        }
        throw new ValidationException("Invalid status transition: " + current + " -> " + next);
    }

    private void requireAdmin(User user) {
        if (user.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Admin access required");
        }
    }

    private String nextTicketNumber() {
        String prefix = "TCK-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-";
        String max = Optional.ofNullable(ticketRepository.findMaxTicketNumberForPrefix(prefix + "%")).orElse("");
        int next = 1;
        if (max.startsWith(prefix)) {
            try {
                next = Integer.parseInt(max.substring(prefix.length())) + 1;
            } catch (NumberFormatException ignored) {
                next = 1;
            }
        }
        return prefix + String.format("%04d", next);
    }

    private void updateSlaState(Ticket ticket, OffsetDateTime now) {
        OffsetDateTime end = ticket.getResolvedAt() != null ? ticket.getResolvedAt() : now;
        Duration responseElapsed = Duration.between(ticket.getCreatedAt() == null ? now : ticket.getCreatedAt(),
                ticket.getFirstResponseAt() == null ? now : ticket.getFirstResponseAt());
        Duration resolutionElapsed = Duration.between(ticket.getCreatedAt() == null ? now : ticket.getCreatedAt(), end);
        Duration resolutionSla = RESOLUTION_SLA.getOrDefault(ticket.getPriority(), RESOLUTION_SLA.get(TicketPriority.MEDIUM));
        ticket.setSlaBreached(responseElapsed.compareTo(RESPONSE_SLA) > 0
                || resolutionElapsed.compareTo(resolutionSla) > 0);
    }

    private <E extends Enum<E>> E parseEnum(Class<E> type, String raw, E fallback) {
        if (raw == null || raw.isBlank()) {
            return fallback;
        }
        try {
            return Enum.valueOf(type, raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            if (fallback != null) {
                return fallback;
            }
            throw new ValidationException("Invalid value: " + raw);
        }
    }

    private String required(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new ValidationException(field + " is required");
        }
        return value.trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private TicketDto toDto(Ticket ticket, boolean includeDetails) {
        User reporter = ticket.getReporter();
        User assignee = ticket.getAssignee();
        List<TicketAttachmentDto> attachments = includeDetails
                ? attachmentRepository.findByTicket_IdOrderByCreatedAtAsc(ticket.getId()).stream().map(this::toAttachmentDto).toList()
                : ticket.getAttachments().stream().map(this::toAttachmentDto).toList();
        List<TicketCommentDto> comments = includeDetails
                ? visibleComments(ticket).stream().map(this::toCommentDto).toList()
                : List.of();
        OffsetDateTime end = ticket.getResolvedAt() != null ? ticket.getResolvedAt() : OffsetDateTime.now();
        long elapsed = ticket.getCreatedAt() == null ? 0 : Duration.between(ticket.getCreatedAt(), end).toMinutes();
        long resolution = ticket.getResolvedAt() == null || ticket.getCreatedAt() == null
                ? 0
                : Duration.between(ticket.getCreatedAt(), ticket.getResolvedAt()).toMinutes();
        return new TicketDto(
                ticket.getId(),
                ticket.getTicketNumber(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getCategory().name(),
                ticket.getPriority().name(),
                ticket.getStatus().name(),
                ticket.getLocation(),
                reporter == null ? null : reporter.getId(),
                reporter == null ? "Unknown" : reporter.getFullName(),
                assignee == null ? null : assignee.getId(),
                assignee == null ? null : assignee.getFullName(),
                ticket.getFirstResponseAt(),
                ticket.getResolvedAt(),
                ticket.isSlaBreached(),
                elapsed,
                resolution,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                attachments,
                comments);
    }

    private List<TicketComment> visibleComments(Ticket ticket) {
        User current = getCurrentUser();
        boolean canSeeInternal = current.getRole() == UserRole.ADMIN || current.getRole() == UserRole.TECHNICIAN;
        return commentRepository.findByTicket_IdAndDeletedAtIsNullOrderByCreatedAtAsc(ticket.getId())
                .stream()
                .filter(comment -> canSeeInternal || !comment.isInternal())
                .toList();
    }

    private TicketCommentDto toCommentDto(TicketComment comment) {
        User author = comment.getAuthor();
        return new TicketCommentDto(
                comment.getId(),
                author == null ? null : author.getId(),
                author == null ? "Unknown" : author.getFullName(),
                author == null ? null : author.getRole().name(),
                comment.getContent(),
                comment.isInternal(),
                comment.getCreatedAt(),
                comment.getUpdatedAt());
    }

    private TicketAttachmentDto toAttachmentDto(TicketAttachment attachment) {
        User uploadedBy = attachment.getUploadedBy();
        return new TicketAttachmentDto(
                attachment.getId(),
                attachment.getFileName(),
                attachment.getFilePath(),
                attachment.getFileSize(),
                attachment.getMimeType(),
                uploadedBy == null ? null : uploadedBy.getId(),
                uploadedBy == null ? "Unknown" : uploadedBy.getFullName(),
                attachment.getCreatedAt());
    }

    private TechnicianWorkloadDto toWorkloadDto(User technician, TechnicianAvailability availability) {
        List<Ticket> assigned = ticketRepository.findByAssignee_IdAndDeletedAtIsNullOrderByCreatedAtDesc(technician.getId());
        List<Ticket> active = assigned.stream().filter(ticket -> ACTIVE_STATUSES.contains(ticket.getStatus())).toList();
        long overdue = active.stream().filter(Ticket::isSlaBreached).count();
        String loadStatus = active.size() >= 8 ? "HIGH" : active.size() >= 4 ? "MEDIUM" : "LOW";
        return new TechnicianWorkloadDto(
                technician.getId(),
                technician.getFullName(),
                availability == null || availability.isAvailable(),
                availability == null ? null : availability.getNote(),
                availability == null ? null : availability.getUpdatedAt(),
                active.size(),
                overdue,
                loadStatus,
                priorityMix(active));
    }

    private boolean isTechnicianAvailable(UUID technicianId) {
        return technicianAvailabilityRepository.findByTechnician_Id(technicianId)
                .map(TechnicianAvailability::isAvailable)
                .orElse(true);
    }

    private Map<UUID, TechnicianAvailability> availabilityByTechnician(List<User> technicians) {
        if (technicians.isEmpty()) {
            return Map.of();
        }
        List<UUID> ids = technicians.stream().map(User::getId).toList();
        Map<UUID, TechnicianAvailability> result = new HashMap<>();
        technicianAvailabilityRepository.findByTechnician_IdIn(ids)
                .forEach(availability -> result.put(availability.getTechnician().getId(), availability));
        return result;
    }

    private TechnicianAvailabilityDto toAvailabilityDto(User technician, TechnicianAvailability availability) {
        return new TechnicianAvailabilityDto(
                technician.getId(),
                technician.getFullName(),
                availability == null || availability.isAvailable(),
                availability == null ? null : availability.getNote(),
                availability == null ? null : availability.getUpdatedAt());
    }

    private Map<String, Long> priorityMix(List<Ticket> tickets) {
        Map<TicketPriority, Long> counts = new EnumMap<>(TicketPriority.class);
        for (TicketPriority priority : TicketPriority.values()) {
            counts.put(priority, 0L);
        }
        tickets.forEach(ticket -> counts.put(ticket.getPriority(), counts.get(ticket.getPriority()) + 1));
        return counts.entrySet().stream().collect(java.util.stream.Collectors.toMap(
                entry -> entry.getKey().name(),
                Map.Entry::getValue));
    }

    private double averageMinutes(List<Duration> durations) {
        if (durations.isEmpty()) {
            return 0;
        }
        return Math.round(durations.stream().mapToLong(Duration::toMinutes).average().orElse(0) * 10.0) / 10.0;
    }

    private void notifyReporter(Ticket ticket, NotificationType type, String title, String message) {
        if (ticket.getReporter() != null) {
            notificationService.createNotification(ticket.getReporter().getId(), type, title, message, ticket.getId(), "TICKET");
        }
    }

    private void notifyParticipants(Ticket ticket, UUID authorId, UUID commentId) {
        if (ticket.getReporter() != null && !ticket.getReporter().getId().equals(authorId)) {
            notificationService.createNotification(ticket.getReporter().getId(), NotificationType.TICKET_COMMENT_ADDED,
                    "New ticket comment", ticket.getTicketNumber() + " has a new comment", ticket.getId(), "TICKET");
        }
        if (ticket.getAssignee() != null && !ticket.getAssignee().getId().equals(authorId)) {
            notificationService.createNotification(ticket.getAssignee().getId(), NotificationType.TICKET_COMMENT_ADDED,
                    "New ticket comment", ticket.getTicketNumber() + " has a new comment", commentId, "TICKET_COMMENT");
        }
    }

    private void notifyAdmins(NotificationType type, String title, String message, UUID referenceId) {
        userRepository.findByRole(UserRole.ADMIN).forEach(admin -> notificationService.createNotification(
                admin.getId(), type, title, message, referenceId, "TICKET"));
    }
}
