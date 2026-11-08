
package com.olympiad.identity.config;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.olympiad.identity.service.JwtService;
import com.olympiad.identity.service.RbacAuthorityService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final RbacAuthorityService rbacAuthorityService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            RbacAuthorityService rbacAuthorityService) {
        this.jwtService = jwtService;
        this.rbacAuthorityService = rbacAuthorityService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null
                && header.startsWith("Bearer ")
                && SecurityContextHolder.getContext()
                        .getAuthentication() == null) {

            String token = header.substring(7);

            try {
                if (jwtService.isTokenValid(token)) {
                    String email = jwtService.extractEmail(token);

                    try {
                        var authorities =
                                rbacAuthorityService.loadAuthorities(email);

                        var authentication =
                                new UsernamePasswordAuthenticationToken(
                                        email,
                                        null,
                                        authorities);

                        SecurityContextHolder.getContext()
                                .setAuthentication(authentication);
                    } catch (IllegalArgumentException ex) {
                        SecurityContextHolder.clearContext();
                        response.setStatus(HttpStatus.UNAUTHORIZED.value());
                        response.setContentType("application/json");
                        response.getWriter().write(
                                "{\"error\":\"UNAUTHORIZED\",\"message\":\"This account is not active\"}");
                        return;
                    }
                } else {
                    SecurityContextHolder.clearContext();
                }
            } catch (Exception ex) {
                SecurityContextHolder.clearContext();
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"error\":\"UNAUTHORIZED\",\"message\":\"Invalid or expired token\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
