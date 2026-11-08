package com.olympiad.course.dto;

import com.olympiad.course.entity.CourseStatus;
import java.time.Instant;
import java.util.UUID;

public record CourseResponse(
    UUID id,
    String code,
    String title,
    String description,
    String subject,
    String gradeLevel,
    CourseStatus status,
    Instant createdAt,
    Instant updatedAt
) {
}