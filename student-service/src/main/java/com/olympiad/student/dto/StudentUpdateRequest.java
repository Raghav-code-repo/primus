package com.olympiad.student.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StudentUpdateRequest(
        @NotBlank @Size(max = 100) String fullName,
        @Size(max = 20) String grade,
        @Size(max = 100) String schoolName,
        @Size(max = 50) String phone
) {}