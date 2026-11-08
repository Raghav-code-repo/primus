
package com.olympiad.liveclass.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record StudentQuestionResponse(
    UUID id,
    UUID liveClassId,
    Integer number,
    String subject,
    String topic,
    String statement,
    List<String> options,
    String explanation,
    Instant createdAt
) {}
