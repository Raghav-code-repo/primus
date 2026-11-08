
package com.olympiad.liveclass.dto;

import java.time.Instant;
import java.util.UUID;

public record JoinLiveClassResponse(
        UUID liveClassId,
        String roomName,
        String participantEmail,
        String participantRole,
        Instant joinedAt,
        String message
) {}
