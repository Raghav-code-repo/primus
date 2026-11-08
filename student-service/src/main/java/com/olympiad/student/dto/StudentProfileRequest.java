package com.olympiad.student.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for a student creating their own profile.
 *
 * <p>The {@code identityUserId} is taken from the validated JWT (claim {@code userId}),
 * never from this DTO. The DTO intentionally excludes {@code identityUserId},
 * {@code id}, {@code createdAt}, and {@code updatedAt} so the client cannot
 * forge or override the authenticated user's identity.
 */
public record StudentProfileRequest(
        @NotBlank @Size(max = 100) String fullName,
        @Size(max = 20) String grade,
        @Size(max = 100) String schoolName,
        @Size(max = 50) String phone
) {}