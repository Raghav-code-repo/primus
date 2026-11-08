package com.olympiad.student.service;

import com.olympiad.student.entity.Enrollment;

/**
 * Result of an enrollment request.
 *
 * @param enrollment the stored enrollment
 * @param created true when a new enrollment row was created, false when a
 *        previously cancelled enrollment was re-activated
 */
public record EnrollmentResult(
        Enrollment enrollment,
        boolean created
) {
}
