package com.olympiad.liveclass.dto;

import java.time.Instant;

/**
 * Response returned to the client when requesting a LiveKit access token.
 *
 * <p>The {@code displayName} field carries the verified display name derived
 * from the Identity Service profile so the UI can label the local tile
 * without trusting a browser-supplied value.
 */
public record LiveKitTokenResponse(
        String token,
        String url,
        String roomName,
        String identity,
        String participantRole,
        Instant expiresAt,
        String displayName
) {
    public LiveKitTokenResponse(
            String token,
            String url,
            String roomName,
            String identity,
            String participantRole,
            Instant expiresAt) {
        this(token, url, roomName, identity, participantRole, expiresAt, null);
    }
}
