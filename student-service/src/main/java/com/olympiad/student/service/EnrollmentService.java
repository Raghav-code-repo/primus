package com.olympiad.student.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.olympiad.student.client.CourseServiceClient;
import com.olympiad.student.dto.CourseSummaryResponse;
import com.olympiad.student.entity.Enrollment;
import com.olympiad.student.entity.EnrollmentStatus;
import com.olympiad.student.exception.CourseNotEnrollableException;
import com.olympiad.student.exception.DuplicateEnrollmentException;
import com.olympiad.student.repository.EnrollmentRepository;
import com.olympiad.student.repository.StudentRepository;

import org.springframework.http.HttpStatus;

/**
 * Owns the enrollment lifecycle of a student.
 *
 * <p>An enrollment is always created for the identity taken from the
 * validated JWT. The course is validated against the Course Service before
 * the enrollment is stored, so an enrollment can never be created for a
 * course that does not exist or that is not open for enrollment.
 */
@Service
@Transactional
public class EnrollmentService {

    /**
     * Course states that accept new enrollments. Mirrors the
     * {@code CourseStatus} of the Course Service.
     */
    private static final Set<String> ENROLLABLE_STATUSES =
            Set.of("PUBLISHED");

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseServiceClient courseServiceClient;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            StudentRepository studentRepository,
            CourseServiceClient courseServiceClient) {

        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.courseServiceClient = courseServiceClient;
    }

    /**
     * Enrolls the given identity in the given course.
     *
     * @param identityUserId stable Identity user id taken from the JWT
     * @param courseId course identifier of the Course Service
     * @param callerToken bearer token forwarded to the Course Service
     * @return the created or re-activated enrollment
     */
    public EnrollmentResult enroll(
            String identityUserId,
            UUID courseId,
            String callerToken) {

        ensureIdentityUserIdPresent(identityUserId);
        ensureCourseIdPresent(courseId);

        CourseSummaryResponse course =
                courseServiceClient.getCourse(courseId, callerToken);

        ensureCourseEnrollable(course);

        Enrollment existing = enrollmentRepository
                .findByIdentityUserIdAndCourseId(identityUserId, courseId)
                .orElse(null);

        if (existing != null) {
            if (existing.getStatus() == EnrollmentStatus.ACTIVE) {
                throw new DuplicateEnrollmentException(
                        "The student is already enrolled in this course");
            }

            // A cancelled enrollment is re-activated instead of creating a
            // second row for the same student and course.
            existing.setStatus(EnrollmentStatus.ACTIVE);
            existing.setStudentProfileId(resolveStudentProfileId(identityUserId));

            return new EnrollmentResult(
                    enrollmentRepository.save(existing), false);
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setIdentityUserId(identityUserId);
        enrollment.setCourseId(courseId);
        enrollment.setStatus(EnrollmentStatus.ACTIVE);
        enrollment.setStudentProfileId(resolveStudentProfileId(identityUserId));

        try {
            return new EnrollmentResult(
                    enrollmentRepository.save(enrollment), true);
        } catch (DataIntegrityViolationException ex) {
            // Lost the race against a concurrent enrollment, the database
            // constraint guarantees a single row per student and course.
            throw new DuplicateEnrollmentException(
                    "The student is already enrolled in this course");
        }
    }

    @Transactional(readOnly = true)
    public List<Enrollment> findByIdentityUserId(String identityUserId) {
        ensureIdentityUserIdPresent(identityUserId);
        return enrollmentRepository
                .findByIdentityUserIdOrderByCreatedAtDesc(identityUserId);
    }

    @Transactional(readOnly = true)
    public List<Enrollment> findAll() {
        return enrollmentRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Lists the enrollments of the administrative view.
     *
     * @param identityUserId optional student filter
     * @param courseId optional course filter
     */
    @Transactional(readOnly = true)
    public List<Enrollment> findAll(String identityUserId, UUID courseId) {
        boolean hasStudent = identityUserId != null && !identityUserId.isBlank();

        if (hasStudent && courseId != null) {
            return enrollmentRepository
                    .findByIdentityUserIdAndCourseIdOrderByCreatedAtDesc(
                            identityUserId.trim(), courseId);
        }

        if (hasStudent) {
            return enrollmentRepository
                    .findByIdentityUserIdOrderByCreatedAtDesc(
                            identityUserId.trim());
        }

        if (courseId != null) {
            return enrollmentRepository
                    .findByCourseIdOrderByCreatedAtDesc(courseId);
        }

        return enrollmentRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Enrollment findById(Long id) {
        return enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Enrollment not found"));
    }

    /**
     * Cancels an enrollment. The row is kept with status
     * {@code CANCELLED} so the history stays visible and the database
     * constraint still prevents a second active row.
     */
    public Enrollment cancel(Long id) {
        Enrollment enrollment = findById(id);

        if (enrollment.getStatus() == EnrollmentStatus.CANCELLED) {
            return enrollment;
        }

        enrollment.setStatus(EnrollmentStatus.CANCELLED);

        return enrollmentRepository.save(enrollment);
    }

    private Long resolveStudentProfileId(String identityUserId) {
        return studentRepository.findByIdentityUserId(identityUserId)
                .map(student -> student.getId())
                .orElse(null);
    }

    private void ensureCourseEnrollable(CourseSummaryResponse course) {
        String status = course.status();

        if (status == null || !ENROLLABLE_STATUSES.contains(status)) {
            throw new CourseNotEnrollableException(
                    "Course is not open for enrollment (status: "
                            + status + ")");
        }
    }

    private void ensureIdentityUserIdPresent(String identityUserId) {
        if (identityUserId == null || identityUserId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Missing identity claim (userId)");
        }
    }

    private void ensureCourseIdPresent(UUID courseId) {
        if (courseId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "courseId is required");
        }
    }
}
