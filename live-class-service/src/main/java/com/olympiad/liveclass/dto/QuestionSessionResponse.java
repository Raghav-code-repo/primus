
package com.olympiad.liveclass.dto;

import com.olympiad.liveclass.entity.QuestionSessionStatus;
import java.time.Instant;
import java.util.UUID;

public record QuestionSessionResponse(
    UUID id,
    UUID liveClassId,
    UUID questionId,
    UUID startedBy,
    Instant startedAt,
    Integer durationSeconds,
    Instant endsAt,
    QuestionSessionStatus status,
    Instant answerRevealedAt
) {}
