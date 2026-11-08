package com.olympiad.content.dto;

import com.olympiad.content.entity.ContentResource;
import com.olympiad.content.entity.ResourceType;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ContentResourceResponse(
    UUID id,
    UUID lessonId,
    ResourceType type,
    String title,
    String url,
    Integer displayOrder,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
    public static ContentResourceResponse from(ContentResource resource) {
        return new ContentResourceResponse(
            resource.getId(),
            resource.getLesson().getId(),
            resource.getType(),
            resource.getTitle(),
            resource.getUrl(),
            resource.getDisplayOrder(),
            resource.getCreatedAt(),
            resource.getUpdatedAt()
        );
    }
}