package com.olympiad.identity.dto.response;

import java.util.UUID;

import com.olympiad.identity.entity.Permission;

public record PermissionResponse(
        UUID id,
        String code,
        String description,
        boolean active
) {
    public static PermissionResponse from(Permission permission) {
        return new PermissionResponse(
                permission.getId(),
                permission.getCode(),
                permission.getDescription(),
                permission.isActive()
        );
    }
}