package edu.sliit.smartcampus.service;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import edu.sliit.smartcampus.dto.TicketAssignRequest;
import edu.sliit.smartcampus.dto.TicketCommentDto;
import edu.sliit.smartcampus.dto.TicketCommentRequest;
import edu.sliit.smartcampus.dto.TicketCreateRequest;
import edu.sliit.smartcampus.dto.TicketDetailDto;
import edu.sliit.smartcampus.dto.TicketEvidenceDto;
import edu.sliit.smartcampus.dto.TicketStatusHistoryDto;
import edu.sliit.smartcampus.dto.TicketSummaryDto;
import edu.sliit.smartcampus.dto.TicketUpdateStatusRequest;
import edu.sliit.smartcampus.exception.ResourceNotFoundException;
import edu.sliit.smartcampus.exception.ValidationException;
import edu.sliit.smartcampus.model.Resource;
import edu.sliit.smartcampus.model.Ticket;
import edu.sliit.smartcampus.model.TicketCategory;
import edu.sliit.smartcampus.model.TicketComment;
import edu.sliit.smartcampus.model.TicketEvidence;
import edu.sliit.smartcampus.model.TicketSeverity;
import edu.sliit.smartcampus.model.TicketStatus;
import edu.sliit.smartcampus.model.TicketStatusHistory;
import edu.sliit.smartcampus.model.User;
import edu.sliit.smartcampus.model.UserRole;
import edu.sliit.smartcampus.repository.ResourceRepository;
import edu.sliit.smartcampus.repository.TicketCommentRepository;
import edu.sliit.smartcampus.repository.TicketEvidenceRepository;
import edu.sliit.smartcampus.repository.TicketRepository;
import edu.sliit.smartcampus.repository.TicketStatusHistoryRepository;
import edu.sliit.smartcampus.repository.UserRepository;

@Service
@Transactional
public class TicketService {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketEvidenceRepository ticketEvidenceRepository;
    private final TicketStatusHistoryRepository ticketStatusHistoryRepository;
    private final Path uploadRoot;
    private final String backendBaseUrl;

    public TicketService(
            AuthService authService,
            UserRepository userRepository,
            ResourceRepository resourceRepository,
            TicketRepository ticketRepository,
            TicketCommentRepository ticketCommentRepository,
            TicketEvidenceRepository ticketEvidenceRepository,
            TicketStatusHistoryRepository ticketStatusHistoryRepository,
            @Value("${app.upload-dir:./uploads}") String uploadDir,
            @Value("${app.backend-base-url:http://localhost:8080}") String backendBaseUrl) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.ticketRepository = ticketRepository;
        this.ticketCommentRepository = ticketCommentRepository;
        this.ticketEvidenceRepository = ticketEvidenceRepository;
        this.ticketStatusHistoryRepository = ticketStatusHistoryRepository;
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.backendBaseUrl = backendBaseUrl.replaceAll("/+$", "");
    }

    @Transactional(readOnly = true)
    public Page<TicketSummaryDto> listTickets(
            String query,
            TicketStatus status,
            TicketSeverity severity,
            TicketCategory category,
            UUID resourceId,
            UUID assignedToId,
            Pageable pageable) {
        User currentUser = getCurrentUser();
        Specification<Ticket> specification = baseAccessSpecification(currentUser)
                .and(matchesQuery(query))
                .and(hasStatus(status))
                .and(hasSeverity(severity))
                .and(hasCategory(category))
                .and(hasResource(resourceId))
                .and(hasAssignedTo(assignedToId));

        return ticketRepository.findAll(specification, pageable).map(this::toSummaryDto);
    }

    public TicketDetailDto createTicket(TicketCreateRequest request) {
        User currentUser = getCurrentUser();
        Resource resource = resourceRepository.findById(request.resourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        Ticket ticket = new Ticket();
        ticket.setResource(resource);
        ticket.setReporter(currentUser);
        ticket.setTitle(request.title().trim());
        ticket.setDescription(request.description().trim());
        ticket.setSeverity(request.severity());
        ticket.setCategory(request.category());
        ticket.setStatus(TicketStatus.OPEN);

        Ticket saved = ticketRepository.save(ticket);
        createStatusHistory(saved, null, TicketStatus.OPEN, currentUser, "Ticket created");
        return toDetailDto(saved);
    }

    @Transactional(readOnly = true)
    public TicketDetailDto getTicket(UUID id) {
        Ticket ticket = getVisibleTicket(id);
        return toDetailDto(ticket);
    }

    public TicketDetailDto updateTicketStatus(UUID id, TicketUpdateStatusRequest request) {
        User currentUser = getCurrentUser();
        Ticket ticket = getManagedTicket(id, currentUser);
        TicketStatus nextStatus = request.status();
        TicketStatus currentStatus = ticket.getStatus();

        if (currentStatus == nextStatus) {
            throw new ValidationException("Ticket is already in the requested status");
        }

        ticket.setStatus(nextStatus);
        if (nextStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(OffsetDateTime.now());
        } else {
            ticket.setResolvedAt(null);
        }

        Ticket saved = ticketRepository.save(ticket);
        createStatusHistory(saved, currentStatus, nextStatus, currentUser, request.notes());
        return toDetailDto(saved);
    }

    public TicketDetailDto assignTicket(UUID id, TicketAssignRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can assign tickets");
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        User assignee = userRepository.findById(request.assignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found"));

        if (assignee.getRole() != UserRole.TECHNICIAN) {
            throw new ValidationException("Assigned user must be a technician");
        }

        ticket.setAssignedTo(assignee);
        ticket.setAssignedBy(currentUser);
        ticket.setAssignedAt(OffsetDateTime.now());
        Ticket saved = ticketRepository.save(ticket);

        if (request.notes() != null && !request.notes().isBlank()) {
            createComment(saved, currentUser, "Assignment note: " + request.notes().trim());
        }

        return toDetailDto(saved);
    }

    public TicketCommentDto addComment(UUID id, TicketCommentRequest request) {
        Ticket ticket = getVisibleTicket(id);
        return createComment(ticket, getCurrentUser(), request.text().trim());
    }

    public TicketEvidenceDto addEvidence(UUID ticketId, MultipartFile file) {
        Ticket ticket = getVisibleTicket(ticketId);
        User currentUser = getCurrentUser();

        if (file == null || file.isEmpty()) {
            throw new ValidationException("Evidence file is required");
        }

        String url = storeEvidence(ticket.getId(), file);

        TicketEvidence evidence = new TicketEvidence();
        evidence.setTicket(ticket);
        evidence.setUrl(url);
        evidence.setUploadedBy(currentUser);

        TicketEvidence saved = ticketEvidenceRepository.save(evidence);
        return toEvidenceDto(saved);
    }

    @Transactional(readOnly = true)
    public List<TicketCommentDto> getComments(UUID ticketId) {
        Ticket ticket = getVisibleTicket(ticketId);
        return ticketCommentRepository.findByTicket_IdOrderByCreatedAtAsc(ticket.getId())
                .stream()
                .map(this::toCommentDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TicketEvidenceDto> getEvidence(UUID ticketId) {
        Ticket ticket = getVisibleTicket(ticketId);
        return ticketEvidenceRepository.findByTicket_IdOrderByUploadedAtAsc(ticket.getId())
                .stream()
                .map(this::toEvidenceDto)
                .toList();
    }

    private TicketCommentDto createComment(Ticket ticket, User currentUser, String text) {
        if (text == null || text.isBlank()) {
            throw new ValidationException("Comment text is required");
        }

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setUser(currentUser);
        comment.setText(text);

        TicketComment saved = ticketCommentRepository.save(comment);
        return toCommentDto(saved);
    }

    private Ticket getVisibleTicket(UUID id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == UserRole.ADMIN) {
            return ticket;
        }
        if (currentUser.getRole() == UserRole.TECHNICIAN
                && ticket.getAssignedTo() != null
                && currentUser.getId().equals(ticket.getAssignedTo().getId())) {
            return ticket;
        }
        if (currentUser.getId().equals(ticket.getReporter().getId())) {
            return ticket;
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this ticket");
    }

    private Ticket getManagedTicket(UUID id, User currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (currentUser.getRole() == UserRole.ADMIN) {
            return ticket;
        }

        if (currentUser.getRole() == UserRole.TECHNICIAN
                && ticket.getAssignedTo() != null
                && currentUser.getId().equals(ticket.getAssignedTo().getId())) {
            return ticket;
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to update this ticket");
    }

    private Specification<Ticket> baseAccessSpecification(User currentUser) {
        return (root, query, cb) -> {
            query.distinct(true);
            if (currentUser.getRole() == UserRole.ADMIN) {
                return cb.conjunction();
            }

            if (currentUser.getRole() == UserRole.TECHNICIAN) {
                return cb.equal(root.get("assignedTo").get("id"), currentUser.getId());
            }

            return cb.equal(root.get("reporter").get("id"), currentUser.getId());
        };
    }

    private Specification<Ticket> matchesQuery(String query) {
        return (root, criteriaQuery, cb) -> {
            if (query == null || query.isBlank()) {
                return cb.conjunction();
            }

            String search = "%" + query.trim().toLowerCase(Locale.ROOT) + "%";
            Join<Ticket, Resource> resourceJoin = root.join("resource", JoinType.LEFT);
            Join<Ticket, User> reporterJoin = root.join("reporter", JoinType.LEFT);
            Join<Ticket, User> assignedJoin = root.join("assignedTo", JoinType.LEFT);
            criteriaQuery.distinct(true);

            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.like(cb.lower(root.get("ticketNumber")), search));
            predicates.add(cb.like(cb.lower(root.get("title")), search));
            predicates.add(cb.like(cb.lower(root.get("description")), search));
            predicates.add(cb.like(cb.lower(resourceJoin.get("name")), search));
            predicates.add(cb.like(cb.lower(reporterJoin.get("fullName")), search));
            predicates.add(cb.like(cb.lower(assignedJoin.get("fullName")), search));
            return cb.or(predicates.toArray(new Predicate[0]));
        };
    }

    private Specification<Ticket> hasStatus(TicketStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    private Specification<Ticket> hasSeverity(TicketSeverity severity) {
        return (root, query, cb) -> severity == null ? cb.conjunction() : cb.equal(root.get("severity"), severity);
    }

    private Specification<Ticket> hasCategory(TicketCategory category) {
        return (root, query, cb) -> category == null ? cb.conjunction() : cb.equal(root.get("category"), category);
    }

    private Specification<Ticket> hasResource(UUID resourceId) {
        return (root, query, cb) -> resourceId == null ? cb.conjunction() : cb.equal(root.get("resource").get("id"), resourceId);
    }

    private Specification<Ticket> hasAssignedTo(UUID assignedToId) {
        return (root, query, cb) -> assignedToId == null ? cb.conjunction() : cb.equal(root.get("assignedTo").get("id"), assignedToId);
    }

    private void createStatusHistory(Ticket ticket, TicketStatus oldStatus, TicketStatus newStatus, User changedBy, String notes) {
        TicketStatusHistory history = new TicketStatusHistory();
        history.setTicket(ticket);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setChangedBy(changedBy);
        history.setNotes(notes == null || notes.isBlank() ? null : notes.trim());
        ticketStatusHistoryRepository.save(history);
    }

    private String storeEvidence(UUID ticketId, MultipartFile file) {
        try {
            Files.createDirectories(uploadRoot);
            Path ticketDirectory = uploadRoot.resolve(ticketId.toString());
            Files.createDirectories(ticketDirectory);

            String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "evidence" : file.getOriginalFilename());
            String extension = StringUtils.getFilenameExtension(originalName);
            String baseName = extension == null || extension.isBlank()
                    ? originalName
                    : originalName.substring(0, Math.max(0, originalName.length() - extension.length() - 1));
            String safeBaseName = baseName == null ? "evidence" : baseName.replaceAll("[^a-zA-Z0-9._-]", "_");
            String safeName = UUID.randomUUID() + "-" + safeBaseName;
            if (extension != null && !extension.isBlank()) {
                safeName = safeName + "." + extension.toLowerCase(Locale.ROOT);
            }

            Path target = ticketDirectory.resolve(safeName).normalize();
            if (!target.startsWith(ticketDirectory)) {
                throw new ValidationException("Invalid evidence file name");
            }
            Files.copy(file.getInputStream(), target);
            return "/uploads/" + ticketId + "/" + safeName;
        } catch (IOException ex) {
            throw new ValidationException("Unable to store evidence file");
        }
    }

    private TicketSummaryDto toSummaryDto(Ticket ticket) {
        return new TicketSummaryDto(
                ticket.getId(),
                ticket.getTicketNumber(),
                ticket.getResource().getId(),
                ticket.getResource().getName(),
                ticket.getReporter().getId(),
                ticket.getReporter().getFullName(),
                ticket.getAssignedTo() == null ? null : ticket.getAssignedTo().getId(),
                ticket.getAssignedTo() == null ? null : ticket.getAssignedTo().getFullName(),
                ticket.getAssignedBy() == null ? null : ticket.getAssignedBy().getId(),
                ticket.getAssignedBy() == null ? null : ticket.getAssignedBy().getFullName(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getSeverity(),
                ticket.getCategory(),
                ticket.getStatus(),
                ticket.getAssignedAt(),
                ticket.getResolvedAt(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticketCommentRepository.countByTicket_Id(ticket.getId()),
                ticketEvidenceRepository.countByTicket_Id(ticket.getId()));
    }

    private TicketDetailDto toDetailDto(Ticket ticket) {
        List<TicketCommentDto> comments = ticketCommentRepository.findByTicket_IdOrderByCreatedAtAsc(ticket.getId())
                .stream()
                .map(this::toCommentDto)
                .toList();
        List<TicketEvidenceDto> evidence = ticketEvidenceRepository.findByTicket_IdOrderByUploadedAtAsc(ticket.getId())
                .stream()
                .map(this::toEvidenceDto)
                .toList();
        List<TicketStatusHistoryDto> history = ticketStatusHistoryRepository.findByTicket_IdOrderByCreatedAtAsc(ticket.getId())
                .stream()
                .map(this::toHistoryDto)
                .toList();

        return new TicketDetailDto(
                ticket.getId(),
                ticket.getTicketNumber(),
                ticket.getResource().getId(),
                ticket.getResource().getName(),
                ticket.getReporter().getId(),
                ticket.getReporter().getFullName(),
                ticket.getAssignedTo() == null ? null : ticket.getAssignedTo().getId(),
                ticket.getAssignedTo() == null ? null : ticket.getAssignedTo().getFullName(),
                ticket.getAssignedBy() == null ? null : ticket.getAssignedBy().getId(),
                ticket.getAssignedBy() == null ? null : ticket.getAssignedBy().getFullName(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getSeverity(),
                ticket.getCategory(),
                ticket.getStatus(),
                ticket.getAssignedAt(),
                ticket.getResolvedAt(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                comments.size(),
                evidence.size(),
                comments,
                evidence,
                history);
    }

    private TicketCommentDto toCommentDto(TicketComment comment) {
        return new TicketCommentDto(
                comment.getId(),
                comment.getUser().getId(),
                comment.getUser().getFullName(),
                comment.getText(),
                comment.getCreatedAt());
    }

    private TicketEvidenceDto toEvidenceDto(TicketEvidence evidence) {
        String url = evidence.getUrl().startsWith("http://") || evidence.getUrl().startsWith("https://")
            ? evidence.getUrl()
            : backendBaseUrl + evidence.getUrl();
        return new TicketEvidenceDto(
                evidence.getId(),
            url,
                evidence.getUploadedBy().getId(),
                evidence.getUploadedBy().getFullName(),
                evidence.getUploadedAt());
    }

    private TicketStatusHistoryDto toHistoryDto(TicketStatusHistory history) {
        return new TicketStatusHistoryDto(
                history.getId(),
                history.getOldStatus(),
                history.getNewStatus(),
                history.getChangedBy().getId(),
                history.getChangedBy().getFullName(),
                history.getNotes(),
                history.getCreatedAt());
    }

    private User getCurrentUser() {
        UUID currentUserId = authService.getCurrentUserId();
        return userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
