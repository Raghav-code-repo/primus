package com.olympiad.liveclass.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public record CreateLiveClassRequest(
    @NotNull UUID courseId,
    UUID teacherId,

    @NotBlank
    @Size(max = 200)
    String title,

    String description,

    @NotNull Instant scheduledStart,
    @NotNull Instant scheduledEnd
) {}