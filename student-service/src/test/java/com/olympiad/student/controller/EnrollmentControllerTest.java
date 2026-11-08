package com.olympiad.student.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import com.olympiad.student.client.CourseServiceClient;
import com.olympiad.student.dto.CoursePageResponse;
import com.olympiad.student.dto.CourseSummaryResponse;
import com.olympiad.student.entity.Enrollment;
import com.olympiad.student.entity.EnrollmentStatus;
import com.olympiad.student.exception.CourseNotFoundException;
import com.olympiad.student.exception.CourseServiceUnavailableException;
import com.olympiad.student.repository.EnrollmentRepository;

@SpringBootTest(properties = {
    "spring.security.oauth2.resourceserver.jwt.secret-key="
        + "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
    "course.service.base-url=http://course-service.test"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EnrollmentControllerTest {

    private static final String STUDENT_ID = "student-1";
    private static final String OTHER_STUDENT_ID = "student-2";
    private static final UUID COURSE_ID =
            UUID.fromString("11111111-2222-3333-4444-555555555555");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @MockitoBean
    private CourseServiceClient courseServiceClient;

    @BeforeEach
    void cleanDatabase() {
        enrollmentRepository.deleteAll();
    }

    @Test
    void createEnrollmentRequiresAToken() throws Exception {
        mockMvc.perform(post("/api/enrollments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"" + COURSE_ID + "\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createEnrollmentStoresTheIdentityOfTheToken() throws Exception {
        stubCourse("PUBLISHED");

        mockMvc.perform(post("/api/enrollments")
                        .with(student(STUDENT_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"" + COURSE_ID + "\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.identityUserId").value(STUDENT_ID))
                .andExpect(jsonPath("$.courseId").value(COURSE_ID.toString()))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    void createEnrollmentIgnoresAnIdentityInTheRequestBody() throws Exception {
        stubCourse("PUBLISHED");

        mockMvc.perform(post("/api/enrollments")
                        .with(student(STUDENT_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"" + COURSE_ID + "\","
                                + "\"identityUserId\":\"" + OTHER_STUDENT_ID + "\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.identityUserId").value(STUDENT_ID));
    }

    @Test
    void createEnrollmentRejectsADuplicate() throws Exception {
        stubCourse("PUBLISHED");
        saveEnrollment(STUDENT_ID, COURSE_ID, EnrollmentStatus.ACTIVE);

        mockMvc.perform(post("/api/enrollments")
                        .with(student(STUDENT_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"" + COURSE_ID + "\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void createEnrollmentRejectsAnUnknownCourse() throws Exception {
        when(courseServiceClient.getCourse(any(UUID.class), any()))
                .thenThrow(new CourseNotFoundException("Course not found"));

        mockMvc.perform(post("/api/enrollments")
                        .with(student(STUDENT_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"" + COURSE_ID + "\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createEnrollmentFailsWhenTheCourseServiceIsUnavailable() throws Exception {
        when(courseServiceClient.getCourse(any(UUID.class), any()))
                .thenThrow(new CourseServiceUnavailableException(
                        "Course Service is unavailable",
                        new RuntimeException("boom")));

        mockMvc.perform(post("/api/enrollments")
                        .with(student(STUDENT_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"" + COURSE_ID + "\"}"))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    void createEnrollmentRejectsACourseThatIsNotEnrollable() throws Exception {
        stubCourse("DRAFT");

        mockMvc.perform(post("/api/enrollments")
                        .with(student(STUDENT_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"" + COURSE_ID + "\"}"))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void findMyEnrollmentsOnlyReturnsTheOwnEnrollments() throws Exception {
        saveEnrollment(STUDENT_ID, COURSE_ID, EnrollmentStatus.ACTIVE);
        saveEnrollment(OTHER_STUDENT_ID, UUID.randomUUID(),
                EnrollmentStatus.ACTIVE);

        mockMvc.perform(get("/api/enrollments/me").with(student(STUDENT_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].identityUserId").value(STUDENT_ID));
    }

    @Test
    void findEnrollmentByIdReturnsTheOwnEnrollment() throws Exception {
        Enrollment enrollment = saveEnrollment(
                STUDENT_ID, COURSE_ID, EnrollmentStatus.ACTIVE);

        mockMvc.perform(get("/api/enrollments/" + enrollment.getId())
                        .with(student(STUDENT_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.identityUserId").value(STUDENT_ID));
    }

    @Test
    void findEnrollmentByIdIsRejectedForAnotherStudent() throws Exception {
        Enrollment enrollment = saveEnrollment(
                OTHER_STUDENT_ID, COURSE_ID, EnrollmentStatus.ACTIVE);

        mockMvc.perform(get("/api/enrollments/" + enrollment.getId())
                        .with(student(STUDENT_ID)))
                .andExpect(status().isForbidden());
    }

    @Test
    void findAllEnrollmentsIsRejectedForAStudent() throws Exception {
        saveEnrollment(STUDENT_ID, COURSE_ID, EnrollmentStatus.ACTIVE);

        mockMvc.perform(get("/api/enrollments").with(student(STUDENT_ID)))
                .andExpect(status().isForbidden());
    }

    @Test
    void findAllEnrollmentsIsAllowedForAnAdministrator() throws Exception {
        saveEnrollment(STUDENT_ID, COURSE_ID, EnrollmentStatus.ACTIVE);
        saveEnrollment(OTHER_STUDENT_ID, UUID.randomUUID(),
                EnrollmentStatus.ACTIVE);

        mockMvc.perform(get("/api/enrollments").with(admin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void cancelEnrollmentCancelsTheOwnEnrollment() throws Exception {
        Enrollment enrollment = saveEnrollment(
                STUDENT_ID, COURSE_ID, EnrollmentStatus.ACTIVE);

        mockMvc.perform(delete("/api/enrollments/" + enrollment.getId())
                        .with(student(STUDENT_ID)))
                .andExpect(status().isNoContent());

        Enrollment cancelled =
                enrollmentRepository.findById(enrollment.getId()).orElseThrow();

        assertThat(cancelled.getStatus()).isEqualTo(EnrollmentStatus.CANCELLED);
    }

    @Test
    void cancelEnrollmentOfAnotherStudentIsRejected() throws Exception {
        Enrollment enrollment = saveEnrollment(
                OTHER_STUDENT_ID, COURSE_ID, EnrollmentStatus.ACTIVE);

        mockMvc.perform(delete("/api/enrollments/" + enrollment.getId())
                        .with(student(STUDENT_ID)))
                .andExpect(status().isForbidden());

        Enrollment unchanged =
                enrollmentRepository.findById(enrollment.getId()).orElseThrow();

        assertThat(unchanged.getStatus()).isEqualTo(EnrollmentStatus.ACTIVE);
    }

    @Test
    void listCoursesReadsTheCatalogOfTheCourseService() throws Exception {
        when(courseServiceClient.listCourses(
                eq("PUBLISHED"), isNull(), anyInt(), anyInt(), any()))
                .thenReturn(new CoursePageResponse(
                        List.of(new CourseSummaryResponse(
                                COURSE_ID, "MATH-1", "Algebra", null,
                                "Mathematics", "8", "PUBLISHED", null, null)),
                        0, 10, 1, 1));

        mockMvc.perform(get("/api/courses").with(student(STUDENT_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Algebra"));
    }

    private void stubCourse(String status) {
        when(courseServiceClient.getCourse(any(UUID.class), any()))
                .thenReturn(new CourseSummaryResponse(
                        COURSE_ID, "MATH-1", "Algebra", null, "Mathematics",
                        "8", status, null, null));
    }

    private Enrollment saveEnrollment(
            String identityUserId, UUID courseId, EnrollmentStatus status) {

        Enrollment enrollment = new Enrollment();
        enrollment.setIdentityUserId(identityUserId);
        enrollment.setCourseId(courseId);
        enrollment.setStatus(status);

        return enrollmentRepository.save(enrollment);
    }

    private RequestPostProcessor student(String identityUserId) {
        return jwt()
                .jwt(builder -> builder.claim("userId", identityUserId))
                .authorities(new SimpleGrantedAuthority("ROLE_STUDENT"));
    }

    private RequestPostProcessor admin() {
        return jwt()
                .jwt(builder -> builder.claim("userId", "admin-1"))
                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }
}
