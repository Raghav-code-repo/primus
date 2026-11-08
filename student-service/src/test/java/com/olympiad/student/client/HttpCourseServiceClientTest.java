package com.olympiad.student.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.time.Duration;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.olympiad.student.config.CourseServiceProperties;
import com.olympiad.student.dto.CoursePageResponse;
import com.olympiad.student.dto.CourseSummaryResponse;
import com.olympiad.student.exception.CourseNotFoundException;
import com.olympiad.student.exception.CourseServiceAccessException;
import com.olympiad.student.exception.CourseServiceUnavailableException;

class HttpCourseServiceClientTest {

    private static final UUID COURSE_ID = UUID.randomUUID();

    private RestClient.Builder restClientBuilder;
    private MockRestServiceServer server;
    private CourseServiceProperties properties;

    @BeforeEach
    void setUp() {
        restClientBuilder = RestClient.builder()
                .baseUrl("http://course-service.test");

        server = MockRestServiceServer.bindTo(restClientBuilder).build();

        properties = new CourseServiceProperties();
        properties.setBaseUrl("http://course-service.test");
        properties.setConnectTimeout(Duration.ofSeconds(1));
        properties.setReadTimeout(Duration.ofSeconds(1));
    }

    @Test
    void getCourseReadsTheCourseAndForwardsTheCallerToken() {
        server.expect(requestTo("http://course-service.test/api/courses/" + COURSE_ID))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header("Authorization", "Bearer caller-token"))
                .andRespond(withSuccess(courseJson(), MediaType.APPLICATION_JSON));

        HttpCourseServiceClient client = client();

        CourseSummaryResponse course = client.getCourse(COURSE_ID, "caller-token");

        assertThat(course.id()).isEqualTo(COURSE_ID);
        assertThat(course.status()).isEqualTo("PUBLISHED");
        assertThat(course.title()).isEqualTo("Algebra");
        server.verify();
    }

    @Test
    void getCourseUsesTheConfiguredServiceToken() {
        properties.setToken("service-token");

        server.expect(requestTo("http://course-service.test/api/courses/" + COURSE_ID))
                .andExpect(header("Authorization", "Bearer service-token"))
                .andRespond(withSuccess(courseJson(), MediaType.APPLICATION_JSON));

        client().getCourse(COURSE_ID, "caller-token");

        server.verify();
    }

    @Test
    void getCourseReportsAnUnknownCourseAsNotFound() {
        server.expect(requestTo("http://course-service.test/api/courses/" + COURSE_ID))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        assertThatThrownBy(() -> client().getCourse(COURSE_ID, "caller-token"))
                .isInstanceOf(CourseNotFoundException.class);
    }

    @Test
    void getCourseReportsARejectedRequestAsAccessError() {
        server.expect(requestTo("http://course-service.test/api/courses/" + COURSE_ID))
                .andRespond(withStatus(HttpStatus.FORBIDDEN));

        assertThatThrownBy(() -> client().getCourse(COURSE_ID, "caller-token"))
                .isInstanceOf(CourseServiceAccessException.class);
    }

    @Test
    void getCourseReportsAnUnreachableServiceAsUnavailable() {
        server.expect(requestTo("http://course-service.test/api/courses/" + COURSE_ID))
                .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        assertThatThrownBy(() -> client().getCourse(COURSE_ID, "caller-token"))
                .isInstanceOf(CourseServiceUnavailableException.class);
    }

    @Test
    void listCoursesReadsThePageOfTheCourseService() {
        server.expect(requestTo("http://course-service.test/api/courses"
                        + "?status=PUBLISHED&subject=Mathematics&page=0&size=10"))
                .andExpect(header("Authorization", "Bearer caller-token"))
                .andRespond(withSuccess(pageJson(), MediaType.APPLICATION_JSON));

        CoursePageResponse page = client()
                .listCourses("PUBLISHED", "Mathematics", 0, 10, "caller-token");

        assertThat(page.totalElements()).isEqualTo(1);
        assertThat(page.totalPages()).isEqualTo(1);
        assertThat(page.content()).hasSize(1);
        assertThat(page.content().get(0).id()).isEqualTo(COURSE_ID);
        server.verify();
    }

    @Test
    void listCoursesReportsAnUnreachableServiceAsUnavailable() {
        server.expect(requestTo("http://course-service.test/api/courses"
                        + "?status=PUBLISHED&page=0&size=10"))
                .andRespond(withStatus(HttpStatus.BAD_GATEWAY));

        assertThatThrownBy(() ->
                client().listCourses("PUBLISHED", null, 0, 10, "caller-token"))
                .isInstanceOf(CourseServiceUnavailableException.class);
    }

    private HttpCourseServiceClient client() {
        return new HttpCourseServiceClient(restClientBuilder.build(), properties);
    }

    private String courseJson() {
        return """
                {
                  "id": "%s",
                  "code": "MATH-1",
                  "title": "Algebra",
                  "description": "Algebra for grade 8",
                  "subject": "Mathematics",
                  "gradeLevel": "8",
                  "status": "PUBLISHED"
                }
                """.formatted(COURSE_ID);
    }

    private String pageJson() {
        return """
                {
                  "content": [%s],
                  "number": 0,
                  "size": 10,
                  "totalElements": 1,
                  "totalPages": 1
                }
                """.formatted(courseJson());
    }
}
