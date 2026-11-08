package com.olympiad.liveclass.dto;

import java.time.Instant;

public record LiveKitTokenResponse(
        String token,
        String url,
        String roomName,
        String identity,
        String participantRole,
        Instant expiresAt
) {}
