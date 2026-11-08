package com.olympiad.student.dto;

import java.time.Instant;
import java.util.UUID;

import com.olympiad.student.entity.Enrollment;
import com.olympiad.student.entity.EnrollmentStatus;

/**
 * Representation of an enrollment.
 *
 * <p>Only identifiers are exposed. Course details are owned by the Course
 * Service and are retrieved through {@code GET /api/courses/{id}} when needed.
 */
public record EnrollmentResponse(
        Long id,
        String identityUserId,
        Long studentProfileId,
        UUID courseId,
        EnrollmentStatus status,
        Instant createdAt,
        Instant updatedAt
) {

    public static EnrollmentResponse from(Enrollment enrollment) {
        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getIdentityUserId(),
                enrollment.getStudentProfileId(),
                enrollment.getCourseId(),
                enrollment.getStatus(),
                enrollment.getCreatedAt(),
                enrollment.getUpdatedAt()
        );
    }
}
