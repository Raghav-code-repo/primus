package com.olympiad.liveclass.integration.dto;

public record LiveKitTokenResponse(
        String serverUrl,
        String roomName,
        String participantIdentity,
        String participantToken
) {
}