package com.olympiad.student.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Course projection returned by the Course Service.
 *
 * <p>The record mirrors the Course Service {@code CourseResponse} contract.
 * Unknown properties returned by the Course Service are ignored by Jackson,
 * so the two services can evolve independently.
 */
public record CourseSummaryResponse(
        UUID id,
        String code,
        String title,
        String description,
        String subject,
        String gradeLevel,
        String status,
        Instant createdAt,
        Instant updatedAt
) {}
