package edu.sliit.smartcampus.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import edu.sliit.smartcampus.dto.AuthResponse;
import edu.sliit.smartcampus.dto.DashboardBootstrapDto;
import edu.sliit.smartcampus.dto.LoginRequest;
import edu.sliit.smartcampus.dto.RefreshRequest;
import edu.sliit.smartcampus.dto.RegisterRequest;
import edu.sliit.smartcampus.dto.UserDto;
import edu.sliit.smartcampus.service.AuthService;
import edu.sliit.smartcampus.service.NotificationService;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final NotificationService notificationService;

    public AuthController(AuthService authService, NotificationService notificationService) {
        this.authService = authService;
        this.notificationService = notificationService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @RequestBody(required = false) RefreshRequest request,
            HttpServletRequest httpRequest) {
        String token = resolveRefreshToken(request, httpRequest);
        AuthResponse response = authService.refresh(token);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    /** D4-B20: Bootstrap endpoint returning user + dashboard config */
    @GetMapping("/bootstrap")
    public ResponseEntity<DashboardBootstrapDto> bootstrap() {
        UserDto user = authService.getCurrentUser();
        String dashboardPath = getDashboardPath(user.role());
        long unreadNotifications = notificationService.getUnreadCount();
        return ResponseEntity.ok(new DashboardBootstrapDto(user, dashboardPath, unreadNotifications));
    }

    private String getDashboardPath(String role) {
        return switch (role) {
            case "ADMIN" -> "/admin";
            case "TECHNICIAN" -> "/dashboard/technician";
            case "STAFF" -> "/dashboard/staff";
            default -> "/dashboard/student";
        };
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestBody(required = false) RefreshRequest request,
            HttpServletRequest httpRequest) {
        String refreshToken = resolveRefreshToken(request, httpRequest);
        authService.logout(refreshToken);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    private String resolveRefreshToken(RefreshRequest request, HttpServletRequest httpRequest) {
        if (request != null && request.refreshToken() != null && !request.refreshToken().isBlank()) {
            return request.refreshToken();
        }

        Cookie[] cookies = httpRequest.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refresh_token".equals(cookie.getName()) && cookie.getValue() != null
                        && !cookie.getValue().isBlank()) {
                    return cookie.getValue();
                }
            }
        }

        throw new IllegalArgumentException("Refresh token is required");
    }
}
