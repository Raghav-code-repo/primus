package com.olympiad.student.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for creating a student profile.
 *
 * <p>The target Identity Service user is identified by {@code identityUserId}.
 * Only administrators (or callers explicitly granted {@code USER_CREATE}) may use
 * this DTO, because it allows binding a profile to an arbitrary identity user.
 *
 * <p>Students must use {@link StudentProfileRequest} on {@code POST /api/students/me}
 * instead, where the identity is taken from the validated JWT.
 */
public record StudentCreateRequest(
        @NotBlank @Size(max = 100) String fullName,
        @NotBlank @Size(max = 20) String grade,
        @NotBlank @Size(max = 100) String schoolName,
        @NotBlank @Size(max = 50) String phone,
        @NotBlank @Size(max = 64) String identityUserId
) {}