
package com.olympiad.liveclass.service;

import com.olympiad.liveclass.client.StudentEnrollmentClient;
import com.olympiad.liveclass.dto.JoinLiveClassResponse;
import com.olympiad.liveclass.entity.LiveClass;
import com.olympiad.liveclass.enums.LiveClassStatus;
import com.olympiad.liveclass.repository.LiveClassAssignmentRepository;
import com.olympiad.liveclass.repository.LiveClassRepository;
import com.olympiad.liveclass.repository.RaisedHandRepository;
import com.olympiad.liveclass.security.LiveClassPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LiveClassServiceJoinTest {

    private static final UUID CLASS_ID = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
    private static final UUID COURSE_ID = UUID.fromString("550e8400-e29b-41d4-a716-446655440001");
    private static final UUID TEACHER_ID = UUID.fromString("650e8400-e29b-41d4-a716-446655440000");
    private static final UUID STUDENT_ID = UUID.fromString("750e8400-e29b-41d4-a716-446655440000");
    private static final UUID ADMIN_ID = UUID.fromString("850e8400-e29b-41d4-a716-446655440000");
    private static final UUID OTHER_TEACHER_ID = UUID.fromString("950e8400-e29b-41d4-a716-446655440000");

    @Mock
    private LiveClassRepository repository;

    @Mock
    private LiveClassAssignmentRepository assignmentRepository;

    @Mock
    private RaisedHandRepository raisedHandRepository;

    @Mock
    private StudentEnrollmentClient enrollmentClient;

    @Mock
    private HttpServletRequest request;

    private LiveClassService createService() {
        return new LiveClassService(
                repository,
                assignmentRepository,
                raisedHandRepository,
                enrollmentClient,
                request);
    }

    private LiveClass scheduledClass(UUID teacherId) {
        LiveClass cls = new LiveClass();
        cls.setCourseId(COURSE_ID);
        cls.setTeacherId(teacherId);
        cls.setTitle("Test Class");
        cls.setScheduledStart(Instant.now().plusSeconds(600));
        cls.setScheduledEnd(Instant.now().plusSeconds(7200));
        cls.setStatus(LiveClassStatus.SCHEDULED);
        cls.setRoomName("test-room");
        return cls;
    }

    private LiveClass cancelledClass(UUID teacherId) {
        LiveClass cls = scheduledClass(teacherId);
        cls.setStatus(LiveClassStatus.CANCELLED);
        return cls;
    }

    private LiveClass pastClass(UUID teacherId) {
        LiveClass cls = scheduledClass(teacherId);
        cls.setScheduledStart(Instant.now().minusSeconds(7200));
        cls.setScheduledEnd(Instant.now().minusSeconds(3600));
        return cls;
    }

    private LiveClass futureClass(UUID teacherId) {
        LiveClass cls = scheduledClass(teacherId);
        cls.setScheduledStart(Instant.now().plusSeconds(7200));
        cls.setScheduledEnd(Instant.now().plusSeconds(10800));
        return cls;
    }

    private LiveClassPrincipal studentPrincipal() {
        return new LiveClassPrincipal(STUDENT_ID.toString(), "student@test.com", Set.of("STUDENT"));
    }

    private LiveClassPrincipal teacherPrincipal() {
        return new LiveClassPrincipal(TEACHER_ID.toString(), "teacher@test.com", Set.of("TEACHER"));
    }

    private LiveClassPrincipal adminPrincipal() {
        return new LiveClassPrincipal(ADMIN_ID.toString(), "admin@test.com", Set.of("ADMIN"));
    }

    private LiveClassPrincipal otherTeacherPrincipal() {
        return new LiveClassPrincipal(OTHER_TEACHER_ID.toString(), "other-teacher@test.com", Set.of("TEACHER"));
    }

    private void studentIsAssigned() {
        when(assignmentRepository.existsByLiveClassIdAndStudentId(CLASS_ID, STUDENT_ID))
                .thenReturn(true);
        when(enrollmentClient.enrolledCourseIds(anyString())).thenReturn(Set.of());
        when(request.getHeader("Authorization")).thenReturn("Bearer test-token");
    }

    @Test
    void studentCanJoinScheduledClass() {
        when(repository.findById(CLASS_ID)).thenReturn(Optional.of(scheduledClass(TEACHER_ID)));
        studentIsAssigned();

        LiveClassService service = createService();
        JoinLiveClassResponse response = service.joinClass(CLASS_ID, studentPrincipal());

        assertThat(response).isNotNull();
        assertThat(response.roomName()).isEqualTo("test-room");
        assertThat(response.participantEmail()).isEqualTo("student@test.com");
        assertThat(response.participantRole()).isEqualTo("STUDENT");
    }

    @Test
    void studentCannotJoinUnassignedClass() {
        when(repository.findById(CLASS_ID)).thenReturn(Optional.of(scheduledClass(TEACHER_ID)));
        when(assignmentRepository.existsByLiveClassIdAndStudentId(CLASS_ID, STUDENT_ID))
                .thenReturn(false);
        when(enrollmentClient.enrolledCourseIds(anyString())).thenReturn(Set.of());
        when(request.getHeader("Authorization")).thenReturn("Bearer test-token");

        LiveClassService service = createService();
        assertThatThrownBy(() -> service.joinClass(CLASS_ID, studentPrincipal()))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class)
                .hasMessage("The student is not assigned to this live class");
    }

    @Test
    void teacherCanJoinOwnClass() {
        when(repository.findById(CLASS_ID)).thenReturn(Optional.of(scheduledClass(TEACHER_ID)));

        LiveClassService service = createService();
        JoinLiveClassResponse response = service.joinClass(CLASS_ID, teacherPrincipal());

        assertThat(response).isNotNull();
        assertThat(response.participantRole()).isEqualTo("TEACHER");
    }

    @Test
    void adminCanJoinAnyClass() {
        when(repository.findById(CLASS_ID)).thenReturn(Optional.of(scheduledClass(TEACHER_ID)));

        LiveClassService service = createService();
        JoinLiveClassResponse response = service.joinClass(CLASS_ID, adminPrincipal());

        assertThat(response).isNotNull();
        assertThat(response.participantRole()).isEqualTo("ADMIN");
    }

    @Test
    void teacherCannotJoinAnotherTeachersClass() {
        when(repository.findById(CLASS_ID)).thenReturn(Optional.of(scheduledClass(OTHER_TEACHER_ID)));

        LiveClassService service = createService();
        assertThatThrownBy(() -> service.joinClass(CLASS_ID, teacherPrincipal()))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class)
                .hasMessage("Teachers can join only their own live classes");
    }

    @Test
    void studentCannotJoinCancelledClass() {
        when(repository.findById(CLASS_ID)).thenReturn(Optional.of(cancelledClass(TEACHER_ID)));
        studentIsAssigned();

        LiveClassService service = createService();
        assertThatThrownBy(() -> service.joinClass(CLASS_ID, studentPrincipal()))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class)
                .hasMessage("This live class has been cancelled");
    }

    @Test
    void studentCannotJoinPastClass() {
        when(repository.findById(CLASS_ID)).thenReturn(Optional.of(pastClass(TEACHER_ID)));
        studentIsAssigned();

        LiveClassService service = createService();
        assertThatThrownBy(() -> service.joinClass(CLASS_ID, studentPrincipal()))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class)
                .hasMessage("The live class has already ended");
    }

    @Test
    void studentCannotJoinFutureClassBeforeJoinWindow() {
        when(repository.findById(CLASS_ID)).thenReturn(Optional.of(futureClass(TEACHER_ID)));
        studentIsAssigned();

        LiveClassService service = createService();
        assertThatThrownBy(() -> service.joinClass(CLASS_ID, studentPrincipal()))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class)
                .hasMessage("The live class join window has not opened yet");
    }

    @Test
    void classNotFoundThrowsException() {
        when(repository.findById(CLASS_ID)).thenReturn(Optional.empty());

        LiveClassService service = createService();
        assertThatThrownBy(() -> service.joinClass(CLASS_ID, studentPrincipal()))
                .isInstanceOf(com.olympiad.liveclass.exception.ResourceNotFoundException.class)
                .hasMessageContaining("Live class not found");
    }
}
