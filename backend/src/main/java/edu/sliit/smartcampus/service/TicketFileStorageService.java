package edu.sliit.smartcampus.service;

import edu.sliit.smartcampus.exception.ValidationException;
import edu.sliit.smartcampus.model.Ticket;
import edu.sliit.smartcampus.model.TicketAttachment;
import edu.sliit.smartcampus.model.User;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class TicketFileStorageService {
    private static final int MAX_FILES = 3;
    private static final long MAX_BYTES = 5L * 1024L * 1024L;
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

    private final Path uploadRoot;

    public TicketFileStorageService(@Value("${app.file-upload-dir:${FILE_UPLOAD_DIR:./uploads}}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public int maxFiles() {
        return MAX_FILES;
    }

    public TicketAttachment store(Ticket ticket, User uploadedBy, MultipartFile file) {
        validate(file);
        try {
            Path ticketDir = uploadRoot.resolve("tickets").resolve(ticket.getId().toString()).normalize();
            Files.createDirectories(ticketDir);

            String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null
                    ? "evidence"
                    : file.getOriginalFilename());
            String extension = "";
            int dot = originalName.lastIndexOf('.');
            if (dot >= 0) {
                extension = originalName.substring(dot);
            }
            String storedName = UUID.randomUUID() + extension;
            Path destination = ticketDir.resolve(storedName).normalize();
            file.transferTo(destination);

            TicketAttachment attachment = new TicketAttachment();
            attachment.setTicket(ticket);
            attachment.setFileName(originalName);
            attachment.setFilePath("/uploads/tickets/" + ticket.getId() + "/" + storedName);
            attachment.setFileSize(file.getSize());
            attachment.setMimeType(file.getContentType());
            attachment.setUploadedBy(uploadedBy);
            return attachment;
        } catch (IOException ex) {
            throw new ValidationException("Could not store ticket attachment");
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Attachment file is empty");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ValidationException("Attachment must be 5MB or smaller");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new ValidationException("Only JPG, PNG, WEBP, or GIF image attachments are allowed");
        }
    }
}
