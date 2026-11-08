package com.olympiad.identity.dto.response;

import java.util.UUID;

import com.olympiad.identity.entity.Role;

public record RoleResponse(
        UUID id,
        String name,
        String description,
        boolean active
) {
    public static RoleResponse from(Role role) {
        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getDescription(),
                role.isActive()
        );
    }
}