package com.olympiad.identity.dto.response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.olympiad.identity.entity.User;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String status,
        boolean emailVerified,
        List<String> roles,
        Instant createdAt
) {
    public static UserResponse from(User user, List<String> roles) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getStatus().name(),
                user.isEmailVerified(),
                List.copyOf(roles),
                user.getCreatedAt()
        );
    }
}