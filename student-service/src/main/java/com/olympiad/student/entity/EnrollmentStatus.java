package com.olympiad.student.entity;

/**
 * Lifecycle state of an enrollment.
 *
 * <p>{@code ACTIVE} means the student is currently enrolled in the course,
 * {@code CANCELLED} means the enrollment was cancelled by the student or by
 * an administrator and may be re-activated by a new enrollment request.
 */
public enum EnrollmentStatus {
    ACTIVE,
    CANCELLED
}
