package com.olympiad.content.repository;

import com.olympiad.content.entity.Lesson;
import com.olympiad.content.entity.LessonStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {

    List<Lesson> findByCourseIdOrderByChapterNumberAsc(UUID courseId);

    List<Lesson> findByCourseIdAndStatusOrderByChapterNumberAsc(
        UUID courseId,
        LessonStatus status
    );

    boolean existsByCourseIdAndChapterNumber(
        UUID courseId,
        Integer chapterNumber
    );
}