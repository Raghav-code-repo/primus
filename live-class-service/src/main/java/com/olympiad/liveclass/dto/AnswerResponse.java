
package com.olympiad.liveclass.dto;

import java.time.Instant;
import java.util.UUID;

public record AnswerResponse(
    UUID id,
    UUID questionSessionId,
    UUID studentUserId,
    Integer optionIndex,
    Instant submittedAt,
    Boolean isCorrect,
    Integer pointsAwarded
) {}
