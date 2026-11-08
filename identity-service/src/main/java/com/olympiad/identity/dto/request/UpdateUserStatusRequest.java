package com.olympiad.identity.dto.request;

import com.olympiad.identity.model.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(
        @NotNull UserStatus status
) {}