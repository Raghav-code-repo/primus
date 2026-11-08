package com.olympiad.student.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

/**
 * Request body for creating an enrollment.
 *
 * <p>The student is never taken from the body. The identity is always derived
 * from the validated JWT ({@code userId} claim), so this DTO intentionally
 * contains no identity, student id or status fields.
 */
public record EnrollmentCreateRequest(
        @NotNull(message = "courseId is required") UUID courseId
) {}
