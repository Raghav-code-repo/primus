
package com.olympiad.liveclass.dto;

import com.olympiad.liveclass.entity.QuestionSessionStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * The currently active question session for a class, combined with the
 * question content. The correct answer and explanation are masked (null) for
 * students until the teacher reveals them.
 */
public record ActiveQuestionView(
    UUID id,
    UUID liveClassId,
    UUID questionId,
    UUID startedBy,
    Instant startedAt,
    Integer durationSeconds,
    Instant endsAt,
    QuestionSessionStatus status,
    Instant answerRevealedAt,
    Integer number,
    String subject,
    String topic,
    String statement,
    List<String> options,
    Integer correctOption,
    String explanation
) {}
