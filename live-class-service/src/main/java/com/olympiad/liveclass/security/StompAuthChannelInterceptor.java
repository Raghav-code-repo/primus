
package com.olympiad.liveclass.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Authenticates STOMP WebSocket connections using the same custom JWT + Identity
 * Service authority flow as the servlet filter. The bearer token is cached per
 * STOMP session so service methods can enforce enrollment checks without an
 * {@link jakarta.servlet.http.HttpServletRequest}.
 */
@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final Logger log =
            LoggerFactory.getLogger(StompAuthChannelInterceptor.class);

    private final LiveClassJwtService jwtService;
    private final ObjectMapper objectMapper;
    private final RestClient identityClient;

    /** STOMP session id -> bearer token. */
    private final Map<String, String> sessionTokens = new ConcurrentHashMap<>();

    public StompAuthChannelInterceptor(
            LiveClassJwtService jwtService,
            ObjectMapper objectMapper,
            RestClient.Builder restClientBuilder,
            @Value("${identity-service.base-url:http://localhost:8080}") String identityBaseUrl) {
        this.jwtService = jwtService;
        this.objectMapper = objectMapper;
        this.identityClient = restClientBuilder
                .baseUrl(identityBaseUrl)
                .build();
    }

    /**
     * Bearer token for the given STOMP session, or null if not authenticated.
     */
    public String getBearerToken(String sessionId) {
        return sessionId != null ? sessionTokens.get(sessionId) : null;
    }

    @Override
    public Message<?> preSend(Message<?> message, org.springframework.messaging.MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            authenticate(accessor);
        } else if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {
            String sessionId = accessor.getSessionId();
            if (sessionId != null) {
                sessionTokens.remove(sessionId);
            }
            SecurityContextHolder.clearContext();
            log.debug("STOMP session disconnected: {}", sessionId);
        }

        return message;
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String header = accessor.getFirstNativeHeader(HttpHeaders.AUTHORIZATION);

        if (header == null || !header.startsWith("Bearer ")) {
            throw new AuthenticationException("Bearer token is missing.");
        }

        String token = header.substring(7).trim();
        if (token.isEmpty()) {
            throw new AuthenticationException("Bearer token is empty.");
        }

        try {
            Claims claims = jwtService.validateAndGetClaims(token);
            String email = jwtService.getEmail(claims);
            String userId = jwtService.getUserId(claims);

            if (email == null || email.isBlank()
                    || userId == null || userId.isBlank()) {
                throw new IllegalArgumentException("JWT user identity is missing.");
            }

            IdentityPermissionsResponse identityResponse =
                    identityClient.get()
                            .uri("/api/auth/permissions")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                            .retrieve()
                            .body(IdentityPermissionsResponse.class);

            if (identityResponse == null
                    || identityResponse.subject() == null
                    || !email.equalsIgnoreCase(identityResponse.subject())
                    || identityResponse.authorities() == null) {
                throw new AuthenticationException("Identity Service returned invalid authority data.");
            }

            Set<SimpleGrantedAuthority> authorities = new HashSet<>();
            identityResponse.authorities().stream()
                    .filter(a -> a != null && !a.isBlank())
                    .map(String::trim)
                    .map(SimpleGrantedAuthority::new)
                    .forEach(authorities::add);

            Set<String> currentRoles = authorities.stream()
                    .map(SimpleGrantedAuthority::getAuthority)
                    .filter(a -> a.startsWith("ROLE_"))
                    .map(a -> a.substring("ROLE_".length()))
                    .collect(java.util.stream.Collectors.toSet());

            LiveClassPrincipal principal = new LiveClassPrincipal(userId, email, currentRoles);

            LiveClassAuthentication authentication =
                    new LiveClassAuthentication(principal, authorities);

            accessor.setUser(authentication);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String sessionId = accessor.getSessionId();
            if (sessionId != null) {
                sessionTokens.put(sessionId, token);
            }

            log.info(
                    "STOMP authenticated: sessionId={}, userId={}, email={}, roles={}",
                    sessionId, principal.userId(), principal.email(), principal.roles()
            );

        } catch (JwtException | IllegalArgumentException | AuthenticationException ex) {
            SecurityContextHolder.clearContext();
            throw new AuthenticationException("The access token is invalid or expired: " + ex.getMessage(), ex);
        } catch (RestClientResponseException ex) {
            SecurityContextHolder.clearContext();
            throw new AuthenticationException("Identity Service rejected the access token.", ex);
        } catch (RestClientException ex) {
            SecurityContextHolder.clearContext();
            throw new AuthenticationException("Identity Service is unavailable.", ex);
        }
    }

    private static class AuthenticationException extends RuntimeException {
        AuthenticationException(String message) {
            super(message);
        }

        AuthenticationException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
