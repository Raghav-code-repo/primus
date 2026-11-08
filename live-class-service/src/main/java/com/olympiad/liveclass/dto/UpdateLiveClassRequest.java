package com.olympiad.liveclass.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record UpdateLiveClassRequest(
    @NotBlank
    @Size(max = 200)
    String title,

    String description,

    Instant scheduledStart,

    Instant scheduledEnd
) {}
