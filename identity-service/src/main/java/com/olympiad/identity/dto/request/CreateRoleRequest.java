package com.olympiad.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateRoleRequest(
        @NotBlank
        @Size(min = 2, max = 50)
        @Pattern(regexp = "[A-Za-z][A-Za-z0-9_]*")
        String name,

        @Size(max = 255)
        String description
) {}