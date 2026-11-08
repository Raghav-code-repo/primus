
package com.olympiad.liveclass.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record SubmitAnswerRequest(
    @NotNull Integer optionIndex
) {}
