package com.olympiad.liveclass.integration.service;

import com.olympiad.liveclass.integration.config.LiveKitProperties;
import com.olympiad.liveclass.integration.dto.LiveKitTokenResponse;

import io.livekit.server.AccessToken;
import io.livekit.server.CanPublish;
import io.livekit.server.CanPublishData;
import io.livekit.server.CanSubscribe;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import io.livekit.server.RoomServiceClient;

import org.springframework.stereotype.Service;

import retrofit2.Response;

import java.io.IOException;

@Service
public class LiveKitIntegrationService {

    private final RoomServiceClient roomServiceClient;
    private final LiveKitProperties properties;

    public LiveKitIntegrationService(
            RoomServiceClient roomServiceClient,
            LiveKitProperties properties) {

        this.roomServiceClient = roomServiceClient;
        this.properties = properties;
    }

    /**
     * Create a LiveKit room.
     */
    public void createRoom(
            String roomName,
            int maxParticipants) {

        try {
            Response<?> response = roomServiceClient
                    .createRoom(roomName, 300, maxParticipants)
                    .execute();

            if (!response.isSuccessful()) {
                throw new IllegalStateException(
                        "LiveKit room creation failed. HTTP status: "
                                + response.code()
                );
            }

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Unable to connect to LiveKit server",
                    exception
            );
        }
    }

    /**
     * Generate a secure participant access token.
     *
     * canPublish should be determined by the authorized
     * application service, not by trusting frontend input.
     */
    public LiveKitTokenResponse generateParticipantToken(
            String roomName,
            String participantIdentity,
            String participantName,
            boolean canPublish) {

        validateRequired(roomName, "Room name");
        validateRequired(participantIdentity, "Participant identity");

        AccessToken accessToken = new AccessToken(
                properties.getApiKey(),
                properties.getApiSecret()
        );

        accessToken.setIdentity(participantIdentity);
        accessToken.setName(participantName);

        // Token validity: default 30 minutes.
        accessToken.setTtl(properties.getTokenTtlMillis());

        // Room-specific participant permissions.
        accessToken.addGrants(
                new RoomJoin(true),
                new RoomName(roomName),
                new CanPublish(canPublish),
                new CanSubscribe(true),
                new CanPublishData(true)
        );

        String jwt = accessToken.toJwt();

        return new LiveKitTokenResponse(
                properties.getWsUrl(),
                roomName,
                participantIdentity,
                jwt
        );
    }

    /**
     * Delete a LiveKit room.
     */
    public void deleteRoom(String roomName) {

        validateRequired(roomName, "Room name");

        try {
            Response<?> response = roomServiceClient
                    .deleteRoom(roomName)
                    .execute();

            if (!response.isSuccessful()) {
                throw new IllegalStateException(
                        "LiveKit room deletion failed. HTTP status: "
                                + response.code()
                );
            }

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Unable to delete LiveKit room",
                    exception
            );
        }
    }

    private void validateRequired(String value, String fieldName) {

        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    fieldName + " cannot be empty"
            );
        }
    }
}