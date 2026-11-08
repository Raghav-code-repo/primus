package com.olympiad.student.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.olympiad.student.client.CourseServiceClient;
import com.olympiad.student.dto.CourseSummaryResponse;
import com.olympiad.student.entity.Enrollment;
import com.olympiad.student.entity.EnrollmentStatus;
import com.olympiad.student.exception.CourseNotEnrollableException;
import com.olympiad.student.exception.CourseNotFoundException;
import com.olympiad.student.exception.CourseServiceUnavailableException;
import com.olympiad.student.exception.DuplicateEnrollmentException;
import com.olympiad.student.repository.EnrollmentRepository;
import com.olympiad.student.repository.StudentRepository;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    private static final String STUDENT_ID = "student-1";
    private static final UUID COURSE_ID = UUID.randomUUID();

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private CourseServiceClient courseServiceClient;

    private EnrollmentService service;

    @BeforeEach
    void setUp() {
        service = new EnrollmentService(
                enrollmentRepository, studentRepository, courseServiceClient);
    }

    @Test
    void enrollCreatesActiveEnrollmentForTheAuthenticatedStudent() {
        when(courseServiceClient.getCourse(COURSE_ID, "token"))
                .thenReturn(course("PUBLISHED"));
        when(enrollmentRepository.findByIdentityUserIdAndCourseId(STUDENT_ID, COURSE_ID))
                .thenReturn(Optional.empty());
        when(studentRepository.findByIdentityUserId(STUDENT_ID))
                .thenReturn(Optional.empty());
        when(enrollmentRepository.save(any(Enrollment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        EnrollmentResult result = service.enroll(STUDENT_ID, COURSE_ID, "token");

        assertThat(result.created()).isTrue();
        assertThat(result.enrollment().getIdentityUserId()).isEqualTo(STUDENT_ID);
        assertThat(result.enrollment().getCourseId()).isEqualTo(COURSE_ID);
        assertThat(result.enrollment().getStatus())
                .isEqualTo(EnrollmentStatus.ACTIVE);
    }

    @Test
    void enrollRejectsAnAlreadyActiveEnrollment() {
        when(courseServiceClient.getCourse(COURSE_ID, "token"))
                .thenReturn(course("PUBLISHED"));

        Enrollment existing = new Enrollment();
        existing.setIdentityUserId(STUDENT_ID);
        existing.setCourseId(COURSE_ID);
        existing.setStatus(EnrollmentStatus.ACTIVE);

        when(enrollmentRepository.findByIdentityUserIdAndCourseId(STUDENT_ID, COURSE_ID))
                .thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.enroll(STUDENT_ID, COURSE_ID, "token"))
                .isInstanceOf(DuplicateEnrollmentException.class);

        verify(enrollmentRepository, never()).save(any(Enrollment.class));
    }

    @Test
    void enrollReactivatesACancelledEnrollment() {
        when(courseServiceClient.getCourse(COURSE_ID, "token"))
                .thenReturn(course("PUBLISHED"));

        Enrollment existing = new Enrollment();
        existing.setIdentityUserId(STUDENT_ID);
        existing.setCourseId(COURSE_ID);
        existing.setStatus(EnrollmentStatus.CANCELLED);

        when(enrollmentRepository.findByIdentityUserIdAndCourseId(STUDENT_ID, COURSE_ID))
                .thenReturn(Optional.of(existing));
        when(studentRepository.findByIdentityUserId(STUDENT_ID))
                .thenReturn(Optional.empty());
        when(enrollmentRepository.save(existing)).thenReturn(existing);

        EnrollmentResult result = service.enroll(STUDENT_ID, COURSE_ID, "token");

        assertThat(result.created()).isFalse();
        assertThat(result.enrollment().getStatus())
                .isEqualTo(EnrollmentStatus.ACTIVE);
    }

    @Test
    void enrollFailsWhenTheCourseDoesNotExist() {
        when(courseServiceClient.getCourse(COURSE_ID, "token"))
                .thenThrow(new CourseNotFoundException("Course not found"));

        assertThatThrownBy(() -> service.enroll(STUDENT_ID, COURSE_ID, "token"))
                .isInstanceOf(CourseNotFoundException.class);

        verify(enrollmentRepository, never()).save(any(Enrollment.class));
    }

    @Test
    void enrollFailsWhenTheCourseIsNotOpenForEnrollment() {
        when(courseServiceClient.getCourse(COURSE_ID, "token"))
                .thenReturn(course("DRAFT"));

        assertThatThrownBy(() -> service.enroll(STUDENT_ID, COURSE_ID, "token"))
                .isInstanceOf(CourseNotEnrollableException.class);

        verify(enrollmentRepository, never()).save(any(Enrollment.class));
    }

    @Test
    void enrollFailsWhenTheCourseServiceIsUnavailable() {
        when(courseServiceClient.getCourse(COURSE_ID, "token"))
                .thenThrow(new CourseServiceUnavailableException(
                        "Course Service is unavailable", new RuntimeException("boom")));

        assertThatThrownBy(() -> service.enroll(STUDENT_ID, COURSE_ID, "token"))
                .isInstanceOf(CourseServiceUnavailableException.class);

        verify(enrollmentRepository, never()).save(any(Enrollment.class));
    }

    @Test
    void findByIdentityUserIdOnlyReturnsTheOwnEnrollments() {
        Enrollment enrollment = new Enrollment();
        enrollment.setIdentityUserId(STUDENT_ID);
        enrollment.setCourseId(COURSE_ID);

        when(enrollmentRepository.findByIdentityUserIdOrderByCreatedAtDesc(STUDENT_ID))
                .thenReturn(List.of(enrollment));

        List<Enrollment> result = service.findByIdentityUserId(STUDENT_ID);

        assertThat(result).containsExactly(enrollment);
        verify(enrollmentRepository).findByIdentityUserIdOrderByCreatedAtDesc(STUDENT_ID);
    }

    @Test
    void findAllFiltersByStudentAndCourse() {
        when(enrollmentRepository
                .findByIdentityUserIdAndCourseIdOrderByCreatedAtDesc(STUDENT_ID, COURSE_ID))
                .thenReturn(List.of());

        service.findAll(STUDENT_ID, COURSE_ID);

        verify(enrollmentRepository)
                .findByIdentityUserIdAndCourseIdOrderByCreatedAtDesc(STUDENT_ID, COURSE_ID);
    }

    @Test
    void cancelMarksTheEnrollmentAsCancelled() {
        Enrollment enrollment = new Enrollment();
        ReflectionTestUtils.setField(enrollment, "id", 3L);
        enrollment.setIdentityUserId(STUDENT_ID);
        enrollment.setCourseId(COURSE_ID);
        enrollment.setStatus(EnrollmentStatus.ACTIVE);

        when(enrollmentRepository.findById(3L)).thenReturn(Optional.of(enrollment));
        when(enrollmentRepository.save(enrollment)).thenReturn(enrollment);

        Enrollment cancelled = service.cancel(3L);

        assertThat(cancelled.getStatus()).isEqualTo(EnrollmentStatus.CANCELLED);
    }

    private CourseSummaryResponse course(String status) {
        return new CourseSummaryResponse(
                COURSE_ID, "MATH-1", "Algebra", "Course", "Mathematics",
                "8", status, null, null);
    }
}
