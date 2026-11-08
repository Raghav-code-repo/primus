
package com.olympiad.liveclass.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public record SendChatMessageRequest(
    @NotNull UUID liveClassId,
    UUID recipientUserId,
    @NotBlank
    @jakarta.validation.constraints.Size(max = 4000)
    String content
) {}
