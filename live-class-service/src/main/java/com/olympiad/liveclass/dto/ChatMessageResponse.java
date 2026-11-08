
package com.olympiad.liveclass.dto;

import java.time.Instant;
import java.util.UUID;

public record ChatMessageResponse(
    UUID id,
    UUID liveClassId,
    UUID senderUserId,
    String senderName,
    UUID recipientUserId,
    String content,
    Instant createdAt,
    Boolean read
) {}
