package com.iktomy.s3lite_backend.config;

import com.iktomy.s3lite_backend.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        log.info("Incoming request: {} {}, Auth header present: {}", 
                 request.getMethod(), request.getRequestURI(), authHeader != null);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.info("No valid Bearer token found in request to {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        log.info("Validating token...");

        try {
            Claims claims = jwtService.validateAndParseClaims(token);
            String username = claims.getSubject();
            String uid = claims.get("uid", String.class);
            
            log.info("Token valid. Subject: {}, UID: {}", username, uid);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                AuthenticatedUser principal = new AuthenticatedUser(
                        UUID.fromString(uid), username);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_USER")));

                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.info("Authentication set in context for user: {}", username);
            } else {
                log.warn("Username was null or context already authenticated. Username: {}", username);
            }
        } catch (Exception e) {
            log.warn("JWT validation failed with exception for request [{} {}]: {} - {}",
                    request.getMethod(), request.getRequestURI(), e.getClass().getName(), e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    public record AuthenticatedUser(UUID userId, String username) {
    }
}
