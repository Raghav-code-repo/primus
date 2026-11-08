package com.olympiad.content.dto;

import com.olympiad.content.entity.Lesson;
import com.olympiad.content.entity.LessonStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record LessonResponse(
    UUID id,
    UUID courseId,
    String subject,
    String grade,
    String title,
    String description,
    Integer chapterNumber,
    LessonStatus status,
    UUID createdBy,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {
    public static LessonResponse from(Lesson lesson) {
        return new LessonResponse(
            lesson.getId(),
            lesson.getCourseId(),
            lesson.getSubject(),
            lesson.getGrade(),
            lesson.getTitle(),
            lesson.getDescription(),
            lesson.getChapterNumber(),
            lesson.getStatus(),
            lesson.getCreatedBy(),
            lesson.getCreatedAt(),
            lesson.getUpdatedAt()
        );
    }
}