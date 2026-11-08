package com.olympiad.liveclass.service;

import com.olympiad.liveclass.dto.LiveKitTokenResponse;
import com.olympiad.liveclass.entity.LiveClass;
import com.olympiad.liveclass.enums.LiveClassStatus;
import com.olympiad.liveclass.repository.LiveClassRepository;
import com.olympiad.liveclass.security.LiveClassPrincipal;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

/**
 * Verifies the actual LiveKit video-grant contents emitted by LiveKitService.
 *
 * Decodes the issued JWT and inspects the "video" claim so that publishing
 * permissions are asserted at the wire format level, not just the DTO.
 */
@ExtendWith(MockitoExtension.class)
class LiveKitGrantVerificationTest {

    private static final UUID CLASS_ID = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
    private static final UUID TEACHER_ID = UUID.fromString("650e8400-e29b-41d4-a716-446655440000");
    private static final UUID STUDENT_ID = UUID.fromString("750e8400-e29b-41d4-a716-446655440000");

    @Mock
    private LiveClassRepository repository;

    @Mock
    private LiveClassService liveClassService;

    private LiveKitService createService() {
        return new LiveKitService(
                repository,
                liveClassService,
                "test-api-key",
                "test-api-secret-key-for-testing-123456",
                "ws://localhost:7880"
        );
    }

    private LiveClass scheduledClass() {
        LiveClass cls = new LiveClass();
        cls.setCourseId(UUID.fromString("550e8400-e29b-41d4-a716-446655440001"));
        cls.setTeacherId(TEACHER_ID);
        cls.setTitle("Test Class");
        cls.setScheduledStart(Instant.now().plusSeconds(600));
        cls.setScheduledEnd(Instant.now().plusSeconds(7200));
        cls.setStatus(LiveClassStatus.SCHEDULED);
        cls.setRoomName("test-room");
        return cls;
    }

    private SecretKey signingKey() {
        // AccessToken signs with HMAC256 over the raw secret string bytes.
        byte[] bytes = "test-api-secret-key-for-testing-123456".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(bytes);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> videoGrants(String token) {
        Map<String, Object> claims = Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return (Map<String, Object>) claims.get("video");
    }

    @Test
    void studentTokenGrantsSpecificPublishSources() {
        when(repository.findById(CLASS_ID)).thenReturn(Optional.of(scheduledClass()));
        doNothing().when(liveClassService).ensureStudentCanAccess(CLASS_ID, STUDENT_ID);

        LiveKitService service = createService();
        LiveKitTokenResponse response = service.generateToken(
                CLASS_ID,
                new LiveClassPrincipal(STUDENT_ID.toString(), "student@test.com", Set.of("STUDENT"))
        );

        Map<String, Object> grants = videoGrants(response.token());

        assertThat(grants.get("roomJoin")).isEqualTo(true);
        assertThat(grants.get("room")).isEqualTo("test-room");
        assertThat(grants.get("canSubscribe")).isEqualTo(true);
        assertThat(grants.get("canPublishData")).isEqualTo(false);
        // Students get basic publish permission so camera/mic publishing works
        // even on LiveKit servers that do not recognize canPublishSources.
        assertThat(grants.get("canPublish")).isEqualTo(true);
        // No room administration privileges for students.
        assertThat(grants).doesNotContainKey("roomAdmin");

        List<String> sources = (List<String>) grants.get("canPublishSources");
        assertThat(sources).containsExactlyInAnyOrder(
                "camera", "microphone", "screen_share", "screen_share_audio");
    }

    @Test
    void teacherTokenGrantsFullPublish() {
        when(repository.findById(CLASS_ID)).thenReturn(Optional.of(scheduledClass()));

        LiveKitService service = createService();
        LiveKitTokenResponse response = service.generateToken(
                CLASS_ID,
                new LiveClassPrincipal(TEACHER_ID.toString(), "teacher@test.com", Set.of("TEACHER"))
        );

        Map<String, Object> grants = videoGrants(response.token());

        assertThat(grants.get("roomJoin")).isEqualTo(true);
        assertThat(grants.get("room")).isEqualTo("test-room");
        assertThat(grants.get("canPublish")).isEqualTo(true);
        assertThat(grants.get("canSubscribe")).isEqualTo(true);
        assertThat(grants.get("canPublishData")).isEqualTo(true);
        // Teachers are not granted room administration; moderation happens
        // through server-side LiveKit APIs, not via the participant token.
        assertThat(grants).doesNotContainKey("roomAdmin");
    }

    @Test
    void studentTokenHasNoAdminOrModerationGrants() {
        when(repository.findById(CLASS_ID)).thenReturn(Optional.of(scheduledClass()));
        doNothing().when(liveClassService).ensureStudentCanAccess(CLASS_ID, STUDENT_ID);

        LiveKitService service = createService();
        LiveKitTokenResponse response = service.generateToken(
                CLASS_ID,
                new LiveClassPrincipal(STUDENT_ID.toString(), "student@test.com", Set.of("STUDENT"))
        );

        Map<String, Object> grants = videoGrants(response.token());
        assertThat(grants).doesNotContainKey("roomAdmin");
        assertThat(grants).doesNotContainKey("roomCreate");
        assertThat(grants).doesNotContainKey("roomList");
        assertThat(grants).doesNotContainKey("ingressAdmin");
        assertThat(grants).doesNotContainKey("recorder");
        assertThat(grants).doesNotContainKey("agent");
    }
}