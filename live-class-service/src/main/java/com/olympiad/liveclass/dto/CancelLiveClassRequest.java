package com.olympiad.liveclass.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CancelLiveClassRequest(
    @NotNull
    UUID id
) {}
