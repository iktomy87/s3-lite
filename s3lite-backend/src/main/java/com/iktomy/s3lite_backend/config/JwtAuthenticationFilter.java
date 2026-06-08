package com.iktomy.s3lite_backend.config;

import com.iktomy.s3lite_backend.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * RF-08 — Filtro JWT: intercepta cada petición, extrae el token de la
 * cabecera {@code Authorization: Bearer <token>}, lo valida e inyecta
 * la identidad del usuario en el {@code SecurityContext} de Spring.
 *
 * <p>Si no hay cabecera Authorization (o es inválida), la petición
 * continúa sin autenticación — Spring Security denegará el acceso a
 * los endpoints protegidos con el 401 correspondiente.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

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

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = jwtService.validateAndParseClaims(token);
            String username = claims.getSubject();
            String uid = claims.get("uid", String.class);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Construimos el principal con userId y username como detalles
                AuthenticatedUser principal = new AuthenticatedUser(
                        UUID.fromString(uid), username);

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                principal,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_USER")));

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (JwtException | IllegalArgumentException ignored) {
            // Token inválido o expirado — continuamos sin autenticar
            // Spring Security retornará 401 si el endpoint lo requiere
        }

        filterChain.doFilter(request, response);
    }

    // ── Principal DTO ────────────────────────────────────────────

    /**
     * Objeto principal inyectado en el SecurityContext.
     * Contiene el userId y el username extraídos del JWT.
     */
    public record AuthenticatedUser(UUID userId, String username) {}
}
