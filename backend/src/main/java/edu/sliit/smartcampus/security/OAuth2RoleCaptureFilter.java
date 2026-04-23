package edu.sliit.smartcampus.security;

import edu.sliit.smartcampus.model.UserRole;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Locale;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class OAuth2RoleCaptureFilter extends OncePerRequestFilter {

    public static final String ROLE_COOKIE_NAME = "oauth_registration_role";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if ("/auth/google".equals(request.getRequestURI())) {
            Cookie cookie = new Cookie(ROLE_COOKIE_NAME, resolveRole(request.getParameter("role")));
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge(5 * 60);
            response.addCookie(cookie);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveRole(String role) {
        if (role == null || role.isBlank()) {
            return UserRole.STUDENT.name();
        }

        try {
            UserRole parsed = UserRole.valueOf(role.trim().toUpperCase(Locale.ROOT));
            return parsed == UserRole.ADMIN ? UserRole.STUDENT.name() : parsed.name();
        } catch (IllegalArgumentException ex) {
            return UserRole.STUDENT.name();
        }
    }
}
