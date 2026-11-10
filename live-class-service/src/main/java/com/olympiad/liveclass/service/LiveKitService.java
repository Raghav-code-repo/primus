package com.olympiad.liveclass.service;

import com.olympiad.liveclass.dto.IdentityProfileResponse;
import com.olympiad.liveclass.dto.LiveKitTokenResponse;
import com.olympiad.liveclass.entity.LiveClass;
import com.olympiad.liveclass.enums.LiveClassStatus;
import com.olympiad.liveclass.repository.LiveClassRepository;
import com.olympiad.liveclass.security.LiveClassPrincipal;
import com.olympiad.liveclass.service.LiveClassService;
import io.livekit.server.AccessToken;
import io.livekit.server.CanPublish;
import io.livekit.server.CanPublishData;
import io.livekit.server.CanPublishSources;
import io.livekit.server.CanSubscribe;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LiveKitService {

    private static final Logger log =
            LoggerFactory.getLogger(LiveKitService.class);

    private final LiveClassRepository repository;
    private final LiveClassService liveClassService;
    private final String apiKey;
    private final String apiSecret;
    private final String livekitUrl;
    private final RestClient identityClient;

    public LiveKitService(
            LiveClassRepository repository,
            LiveClassService liveClassService,
            @Value("${livekit.api-key}") String apiKey,
            @Value("${livekit.api-secret}") String apiSecret,
            @Value("${livekit.url:ws://localhost:7880}") String livekitUrl,
            RestClient.Builder restClientBuilder,
            @Value("${identity-service.base-url:http://localhost:8080}") String identityBaseUrl
    ) {
        this.repository = repository;
        this.liveClassService = liveClassService;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.livekitUrl = livekitUrl;
        this.identityClient = restClientBuilder
                .baseUrl(identityBaseUrl)
                .build();
    }

    @Transactional(readOnly = true)
    public LiveKitTokenResponse generateToken(
            UUID classId,
            LiveClassPrincipal principal,
            String authorization
    ) {
        if (principal == null || principal.userId() == null || principal.email() == null) {
            log.warn(
                    "Token request rejected: missing authenticated principal userId={} email={}",
                    principal != null ? principal.userId() : null,
                    principal != null ? principal.email() : null
            );
            throw new AccessDeniedException("A valid authenticated user is required");
        }

        Set<String> authorities = currentAuthorities();

        log.info(
                "Token request: classId={}, principalUserId={}, principalEmail={}, roles={}, authorities={}",
                classId, principal.userId(), principal.email(), principal.roles(), authorities
        );

        LiveClass liveClass = repository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Live class not found: " + classId));

        log.info(
                "Class resolved: classId={}, teacherId={}, courseId={}, status={}, scheduledStart={}, scheduledEnd={}",
                classId, liveClass.getTeacherId(), liveClass.getCourseId(), liveClass.getStatus(),
                liveClass.getScheduledStart(), liveClass.getScheduledEnd()
        );

        Set<String> roles = principal.roles();
        boolean isAdmin = roles != null && roles.contains("ADMIN");
        boolean isTeacher = roles != null && roles.contains("TEACHER");
        boolean isStudent = roles != null && roles.contains("STUDENT");

        boolean canJoin = false;
        String participantRole = "STUDENT";

        if (isAdmin) {
            canJoin = true;
            participantRole = "ADMIN";
            log.info("Authorization granted: admin classId={} userId={}", classId, principal.userId());
        } else if (isTeacher) {
            UUID teacherId;
            try {
                teacherId = UUID.fromString(principal.userId());
            } catch (Exception e) {
                log.warn(
                        "Authorization rejected: invalid principal userId classId={} userId={} reason=invalid_uuid",
                        classId, principal.userId()
                );
                throw new AccessDeniedException("Authenticated user ID is invalid");
            }
            log.debug(
                    "Teacher authorization: classId={} principalTeacherId={} classTeacherId={}",
                    classId, teacherId, liveClass.getTeacherId()
            );
            if (teacherId.equals(liveClass.getTeacherId())) {
                canJoin = true;
                participantRole = "TEACHER";
                log.info(
                        "Authorization granted: teacher classId={} teacherId={}",
                        classId, teacherId
                );
            } else {
                log.warn(
                        "Authorization rejected: teacher not owner classId={} principalTeacherId={} classTeacherId={}",
                        classId, teacherId, liveClass.getTeacherId()
                );
                throw new AccessDeniedException("Teachers can join only their own live classes");
            }
        } else if (isStudent) {
            UUID studentId;
            try {
                studentId = UUID.fromString(principal.userId());
            } catch (Exception e) {
                log.warn(
                        "Authorization rejected: invalid principal userId classId={} userId={} reason=invalid_uuid",
                        classId, principal.userId()
                );
                throw new AccessDeniedException("Authenticated user ID is invalid");
            }
            log.debug("Student authorization: classId={} studentId={}", classId, studentId);
            try {
                liveClassService.ensureStudentCanAccess(classId, studentId);
            } catch (AccessDeniedException ex) {
                log.warn(
                        "Authorization rejected: student not assigned/enrolled classId={} studentId={} reason={}",
                        classId, studentId, ex.getMessage()
                );
                throw ex;
            }
            canJoin = true;
            participantRole = "STUDENT";
            log.info(
                    "Authorization granted: student classId={} studentId={}",
                    classId, studentId
            );
        }

        if (!canJoin) {
            log.warn(
                    "Authorization rejected: no role matched classId={} userId={} roles={}",
                    classId, principal.userId(), roles
            );
            throw new AccessDeniedException("You are not authorized to join this class");
        }

        log.info(
                "LiveKit token: classId={}, userId={}, role={}, room={}",
                classId, principal.userId(), participantRole, liveClass.getRoomName()
        );

        if (liveClass.getStatus() == LiveClassStatus.CANCELLED) {
            log.warn(
                    "Authorization rejected: class cancelled classId={} userId={}",
                    classId, principal.userId()
            );
            throw new AccessDeniedException("This live class has been cancelled");
        }

        Instant now = Instant.now();
        Instant joinOpensAt = liveClass.getScheduledStart().minusSeconds(600);
        if (now.isBefore(joinOpensAt)) {
            log.warn(
                    "Authorization rejected: join window not open classId={} userId={} scheduledStart={}",
                    classId, principal.userId(), liveClass.getScheduledStart()
            );
            throw new AccessDeniedException("The live class join window has not opened yet");
        }
        if (!now.isBefore(liveClass.getScheduledEnd())) {
            log.warn(
                    "Authorization rejected: class already ended classId={} userId={} scheduledEnd={}",
                    classId, principal.userId(), liveClass.getScheduledEnd()
            );
            throw new AccessDeniedException("The live class has already ended");
        }

        Instant expiresAt = now.plusSeconds(3600);

        /* ====================================================================
         * Verified display name from Identity Service profile.
         * Never trust a name supplied by the browser; the name below is fetched
         * server-side using the bearer token the client already holds.
         * ==================================================================== */
        String displayName = resolveDisplayName(authorization, principal);

        AccessToken accessToken = new AccessToken(apiKey, apiSecret);
        accessToken.setIdentity(principal.userId());
        accessToken.setName(displayName);
        accessToken.setExpiration(Date.from(expiresAt));

        if ("TEACHER".equals(participantRole) || "ADMIN".equals(participantRole)) {
            accessToken.addGrants(
                    new RoomJoin(true),
                    new RoomName(liveClass.getRoomName()),
                    new CanPublish(true),
                    new CanSubscribe(true),
                    new CanPublishData(true)
            );
        } else {
            accessToken.addGrants(
                    new RoomJoin(true),
                    new RoomName(liveClass.getRoomName()),
                    new CanPublish(true),
                    new CanPublishSources(List.of(
                            "camera",
                            "microphone",
                            "screen_share",
                            "screen_share_audio"
                    )),
                    new CanSubscribe(true),
                    new CanPublishData(false)
            );
        }

        String token = accessToken.toJwt();

        return new LiveKitTokenResponse(
                token,
                livekitUrl,
                liveClass.getRoomName(),
                principal.userId(),
                participantRole,
                expiresAt,
                displayName
        );
    }

    /**
     * Resolves the verified display name for the authenticated principal.
     *
     * <p>The profile is retrieved from Identity Service {@code GET /api/auth/me}
     * using the bearer token the client already holds. Name order:
     * trimmed {@code firstName + lastName} -> email prefix. If the profile
     * cannot be reached, falls back to the email prefix so the UI never shows
     * a raw UUID and never leaks credentials.
     */
    private String resolveDisplayName(String authorization, LiveClassPrincipal principal) {
        if (authorization != null && !authorization.isBlank()) {
            try {
                IdentityProfileResponse profile = identityClient.get()
                        .uri("/api/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .retrieve()
                        .body(IdentityProfileResponse.class);
                if (profile != null) {
                    String name = profile.buildDisplayName();
                    if (name != null && !name.isBlank()) {
                        return name;
                    }
                }
            } catch (RestClientException ex) {
                // Profile lookup temporarily unavailable: fall back gracefully.
                log.debug("Identity profile lookup unavailable for userId={}",
                        principal.userId());
            }
        }

        // Safe fallback from verified email only.
        String email = principal.email();
        if (email != null && !email.isBlank()) {
            int at = email.indexOf('@');
            String prefix = (at > 0 ? email.substring(0, at) : email).trim();
            if (!prefix.isBlank()) {
                return prefix;
            }
        }
        return "Participant";
    }

    private Set<String> currentAuthorities() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities() == null) {
            return Set.of();
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
    }
}
