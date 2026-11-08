
package com.olympiad.liveclass.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.UUID;

public record StartQuestionRequest(
    @NotNull UUID questionId,
    @NotNull
    @Positive
    Integer durationSeconds
) {}
