package edu.sliit.smartcampus.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import edu.sliit.smartcampus.dto.AuthResponse;
import edu.sliit.smartcampus.service.AuthService;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final String frontendUrl;
    private final AuthService authService;

    public OAuth2SuccessHandler(
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl,
            AuthService authService) {
        this.frontendUrl = frontendUrl;
        this.authService = authService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        AuthResponse authResponse = authService.handleOAuthLogin(oAuth2User, getRequestedRole(request));

        Cookie cookie = new Cookie("refresh_token", authResponse.refreshToken());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(cookie);
        response.addCookie(expireCookie(OAuth2RoleCaptureFilter.ROLE_COOKIE_NAME));

        String redirectUrl = String.format(
                "%s/login?access_token=%s&refresh_token=%s",
                frontendUrl,
                urlEncode(authResponse.accessToken()),
                urlEncode(authResponse.refreshToken()));

        response.sendRedirect(redirectUrl);
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String getRequestedRole(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }

        for (Cookie cookie : request.getCookies()) {
            if (OAuth2RoleCaptureFilter.ROLE_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private Cookie expireCookie(String name) {
        Cookie cookie = new Cookie(name, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        return cookie;
    }
}
