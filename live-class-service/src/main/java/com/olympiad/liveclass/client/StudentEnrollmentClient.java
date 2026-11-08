
package com.olympiad.liveclass.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Reads the courses the signed-in student is enrolled in from the Student
 * Service.
 *
 * <p>Used as a best-effort input to live-class visibility: a student sees a
 * live class when it is explicitly assigned to them
 * ({@code live_class_assignments}) or when it belongs to a course they are
 * enrolled in. The call never breaks visibility: when the Student Service is
 * unreachable or the token is invalid, an empty set is returned and visibility
 * falls back to explicit assignments only.
 */
@Component
public class StudentEnrollmentClient {

    private final RestClient restClient;

    public StudentEnrollmentClient(
            RestClient.Builder builder,
            @Value("${student-service.base-url:http://localhost:8082}") String baseUrl) {
        this.restClient = builder.baseUrl(baseUrl).build();
    }

    /**
     * Returns the ids of the courses the bearer-token subject is actively
     * enrolled in. Never throws: failures are degraded to an empty set.
     */
    public Set<UUID> enrolledCourseIds(String bearerToken) {
        try {
            String token = bearerToken != null ? bearerToken.trim() : null;
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring("Bearer ".length()).trim();
            }
            final String authToken = token;
            List<EnrollmentCourseRef> refs = restClient.get()
                    .uri("/api/enrollments/me")
                    .headers(headers -> {
                        if (authToken != null && !authToken.isEmpty()) {
                            headers.setBearerAuth(authToken);
                        }
                    })
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<EnrollmentCourseRef>>() {
                    });
            if (refs == null) {
                return Set.of();
            }
            return refs.stream()
                    .map(EnrollmentCourseRef::courseId)
                    .collect(Collectors.toSet());
        } catch (Exception ex) {
            return Set.of();
        }
    }

    /**
     * Minimal projection of an enrollment row: only the course id is needed
     * for visibility. Extra fields returned by the Student Service are ignored.
     */
    record EnrollmentCourseRef(UUID courseId) {
    }
}
