package com.olympiad.student.client;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.olympiad.student.config.CourseServiceProperties;
import com.olympiad.student.dto.CoursePageResponse;
import com.olympiad.student.dto.CourseSummaryResponse;
import com.olympiad.student.exception.CourseNotFoundException;
import com.olympiad.student.exception.CourseServiceAccessException;
import com.olympiad.student.exception.CourseServiceUnavailableException;

/**
 * HTTP based implementation of the {@link CourseServiceClient}.
 *
 * <p>Authentication uses the trusted service account token when one is
 * configured ({@code course.service.token}). Otherwise the bearer token of
 * the incoming request is forwarded so the Course Service applies the RBAC of
 * the end user.
 */
public class HttpCourseServiceClient implements CourseServiceClient {

    private final RestClient restClient;
    private final CourseServiceProperties properties;

    public HttpCourseServiceClient(
            RestClient restClient,
            CourseServiceProperties properties) {

        this.restClient = restClient;
        this.properties = properties;
    }

    @Override
    public CourseSummaryResponse getCourse(UUID courseId, String callerToken) {
        try {
            CourseSummaryResponse course = restClient.get()
                    .uri("/api/courses/{id}", courseId)
                    .headers(headers -> applyAuthorization(headers, callerToken))
                    .retrieve()
                    .body(CourseSummaryResponse.class);

            if (course == null) {
                throw new CourseNotFoundException(
                        "Course not found: " + courseId);
            }

            return course;

        } catch (HttpClientErrorException.NotFound ex) {
            throw new CourseNotFoundException(
                    "Course not found: " + courseId);

        } catch (HttpClientErrorException ex) {
            throw new CourseServiceAccessException(
                    "Course Service rejected the request: " + ex.getStatusCode(),
                    ex);

        } catch (RestClientException ex) {
            throw new CourseServiceUnavailableException(
                    "Course Service is unavailable", ex);
        }
    }

    @Override
    public CoursePageResponse listCourses(
            String status,
            String subject,
            int page,
            int size,
            String callerToken) {

        try {
            CoursePagePayload payload = restClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path("/api/courses");

                        if (status != null && !status.isBlank()) {
                            uriBuilder.queryParam("status", status);
                        }
                        if (subject != null && !subject.isBlank()) {
                            uriBuilder.queryParam("subject", subject);
                        }

                        return uriBuilder
                                .queryParam("page", page)
                                .queryParam("size", size)
                                .build();
                    })
                    .headers(headers -> applyAuthorization(headers, callerToken))
                    .retrieve()
                    .body(CoursePagePayload.class);

            if (payload == null) {
                return new CoursePageResponse(List.of(), page, size, 0, 0);
            }

            return new CoursePageResponse(
                    payload.content() == null ? List.of() : payload.content(),
                    payload.number() == null ? page : payload.number(),
                    payload.size() == null ? size : payload.size(),
                    payload.totalElements() == null ? 0 : payload.totalElements(),
                    payload.totalPages() == null ? 0 : payload.totalPages()
            );

        } catch (HttpClientErrorException ex) {
            throw new CourseServiceAccessException(
                    "Course Service rejected the request: " + ex.getStatusCode(),
                    ex);

        } catch (RestClientException ex) {
            throw new CourseServiceUnavailableException(
                    "Course Service is unavailable", ex);
        }
    }

    /**
     * Applies the trusted service account token when configured, otherwise the
     * bearer token of the incoming request is forwarded.
     */
    private void applyAuthorization(
            HttpHeaders headers, String callerToken) {

        String serviceToken = properties.getToken();

        if (serviceToken != null && !serviceToken.isBlank()) {
            headers.setBearerAuth(serviceToken);
            return;
        }

        if (callerToken != null && !callerToken.isBlank()) {
            headers.setBearerAuth(callerToken);
        }
    }

    /**
     * Payload of the Course Service paged course listing.
     */
    record CoursePagePayload(
            List<CourseSummaryResponse> content,
            Integer number,
            Integer size,
            Long totalElements,
            Integer totalPages
    ) {}
}
