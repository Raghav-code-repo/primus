
package com.olympiad.liveclass.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.olympiad.liveclass.exception.ApiError;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class LiveClassJwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final LiveClassJwtService jwtService;
    private final ObjectMapper objectMapper;
    private final RestClient identityClient;

    public LiveClassJwtAuthenticationFilter(
            LiveClassJwtService jwtService,
            ObjectMapper objectMapper,
            RestClient.Builder restClientBuilder,
            @Value("${identity-service.base-url:http://localhost:8080}")
            String identityBaseUrl) {

        this.jwtService = jwtService;
        this.objectMapper = objectMapper;

        this.identityClient = restClientBuilder
                .baseUrl(identityBaseUrl)
                .build();
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);

        // No bearer token: let Spring Security handle the request.
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7).trim();

        if (token.isEmpty()) {
            SecurityContextHolder.clearContext();

            writeError(
                    response,
                    request,
                    401,
                    "Unauthorized",
                    "Bearer token is missing."
            );
            return;
        }

        /*
         * IMPORTANT:
         * This try/catch handles authentication only.
         * chain.doFilter() is intentionally called after this block,
         * so application exceptions are not mistaken for JWT errors.
         */
        try {
            Claims claims = jwtService.validateAndGetClaims(token);

            String email = jwtService.getEmail(claims);
            String userId = jwtService.getUserId(claims);

            if (email == null || email.isBlank()
                    || userId == null || userId.isBlank()) {

                throw new IllegalArgumentException(
                        "JWT user identity is missing.");
            }

            // Load current permissions and roles from Identity Service.
            IdentityPermissionsResponse identityResponse =
                    identityClient.get()
                            .uri("/api/auth/permissions")
                            .header(
                                    HttpHeaders.AUTHORIZATION,
                                    "Bearer " + token
                            )
                            .retrieve()
                            .body(IdentityPermissionsResponse.class);

            if (identityResponse == null
                    || identityResponse.subject() == null
                    || !email.equalsIgnoreCase(
                            identityResponse.subject())
                    || identityResponse.authorities() == null) {

                SecurityContextHolder.clearContext();

                writeError(
                        response,
                        request,
                        401,
                        "Unauthorized",
                        "Identity Service returned invalid authority data."
                );
                return;
            }

            Set<SimpleGrantedAuthority> authorities = new HashSet<>();

            identityResponse.authorities().stream()
                    .filter(authority ->
                            authority != null && !authority.isBlank())
                    .map(String::trim)
                    .forEach(authority ->
                            authorities.add(
                                    new SimpleGrantedAuthority(authority)
                            ));

            // Use current roles from Identity Service, not JWT role claims.
            Set<String> currentRoles = authorities.stream()
                    .map(SimpleGrantedAuthority::getAuthority)
                    .filter(authority ->
                            authority.startsWith("ROLE_"))
                    .map(authority ->
                            authority.substring("ROLE_".length()))
                    .collect(Collectors.toSet());

            LiveClassPrincipal principal = new LiveClassPrincipal(
                    userId,
                    email,
                    currentRoles
            );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            authorities
                    );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

        } catch (JwtException | IllegalArgumentException ex) {

            SecurityContextHolder.clearContext();

            writeError(
                    response,
                    request,
                    401,
                    "Unauthorized",
                    "The access token is invalid or expired."
            );
            return;

        } catch (RestClientResponseException ex) {

            SecurityContextHolder.clearContext();

            if (ex.getStatusCode().value() == 401
                    || ex.getStatusCode().value() == 403) {

                writeError(
                        response,
                        request,
                        401,
                        "Unauthorized",
                        "Identity Service rejected the access token."
                );

            } else {
                writeError(
                        response,
                        request,
                        503,
                        "Service Unavailable",
                        "Identity Service could not validate permissions."
                );
            }
            return;

        } catch (RestClientException ex) {

            SecurityContextHolder.clearContext();

            writeError(
                    response,
                    request,
                    503,
                    "Service Unavailable",
                    "Identity Service is unavailable."
            );
            return;
        }

        // Only continue after authentication processing has succeeded.
        // Exceptions from controllers and services now propagate normally.
        chain.doFilter(request, response);
    }

    private void writeError(
            HttpServletResponse response,
            HttpServletRequest request,
            int status,
            String error,
            String message) throws IOException {

        if (response.isCommitted()) {
            return;
        }

        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        objectMapper.writeValue(
                response.getOutputStream(),
                ApiError.of(
                        status,
                        error,
                        message,
                        request.getRequestURI()
                )
        );
    }
}
