package edu.sliit.smartcampus.controller;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import edu.sliit.smartcampus.dto.SecurityActivityLogDto;
import edu.sliit.smartcampus.service.SecurityActivityService;

/**
 * D4-B25: Security activity log endpoints for authenticated users.
 * GET /api/v1/auth/security-activity
 * GET /api/v1/auth/security-activity/suspicious
 */
@RestController
@RequestMapping("/api/v1/auth/security-activity")
public class SecurityActivityController {

    private final SecurityActivityService securityActivityService;

    public SecurityActivityController(SecurityActivityService securityActivityService) {
        this.securityActivityService = securityActivityService;
    }

    @GetMapping
    public ResponseEntity<Page<SecurityActivityLogDto>> getMyActivity(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                securityActivityService.getActivityForCurrentUser(PageRequest.of(page, size)));
    }

    @GetMapping("/suspicious")
    public ResponseEntity<List<SecurityActivityLogDto>> getSuspiciousActivity() {
        return ResponseEntity.ok(securityActivityService.getSuspiciousActivityForCurrentUser());
    }

    @PutMapping("/suspicious/acknowledge")
    public ResponseEntity<Void> acknowledgeSuspiciousActivity() {
        securityActivityService.acknowledgeSuspiciousForCurrentUser();
        return ResponseEntity.noContent().build();
    }
}
