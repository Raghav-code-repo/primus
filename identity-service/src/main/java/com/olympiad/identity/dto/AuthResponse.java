package com.olympiad.identity.dto;

import java.util.List;
import java.util.UUID;

public record AuthResponse(
    String accessToken,
    String tokenType,
    long expiresIn,
    UserProfile user
) {
    public record UserProfile(
        UUID id,
        String email,
        String firstName,
        String lastName,
        List<String> roles
    ) {}
}