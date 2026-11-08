
package com.olympiad.liveclass.dto;

import java.time.Instant;
import java.util.UUID;

public record RaisedHandResponse(
        UUID id,
        UUID liveClassId,
        UUID userId,
        Instant raisedAt,
        boolean accepted
) {}
