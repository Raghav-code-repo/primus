package com.olympiad.content.service;

import com.olympiad.content.dto.CreateLessonRequest;
import com.olympiad.content.dto.LessonResponse;
import com.olympiad.content.dto.UpdateLessonRequest;
import com.olympiad.content.entity.Lesson;
import com.olympiad.content.entity.LessonStatus;
import com.olympiad.content.exception.ResourceNotFoundException;
import com.olympiad.content.repository.LessonRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;

    public LessonService(LessonRepository lessonRepository) {
        this.lessonRepository = lessonRepository;
    }

    @Transactional
    public LessonResponse create(CreateLessonRequest request, UUID userId) {
        Lesson lesson = new Lesson();
        lesson.setCourseId(request.courseId());
        lesson.setSubject(request.subject());
        lesson.setGrade(request.grade());
        lesson.setTitle(request.title());
        lesson.setDescription(request.description());
        lesson.setChapterNumber(request.chapterNumber());
        lesson.setStatus(LessonStatus.DRAFT);
        lesson.setCreatedBy(userId);

        return LessonResponse.from(lessonRepository.save(lesson));
    }

    @Transactional(readOnly = true)
    public List<LessonResponse> getAll() {
        return lessonRepository.findAll()
            .stream()
            .map(LessonResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public LessonResponse getById(UUID id) {
        return LessonResponse.from(findLesson(id));
    }

    @Transactional(readOnly = true)
    public List<LessonResponse> getByCourse(UUID courseId) {
        return lessonRepository
            .findByCourseIdOrderByChapterNumberAsc(courseId)
            .stream()
            .map(LessonResponse::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<LessonResponse> getPublishedByCourse(UUID courseId) {
        return lessonRepository
            .findByCourseIdAndStatusOrderByChapterNumberAsc(
                courseId, LessonStatus.PUBLISHED
            )
            .stream()
            .map(LessonResponse::from)
            .toList();
    }

    @Transactional
    public LessonResponse update(UUID id, UpdateLessonRequest request) {
        Lesson lesson = findLesson(id);

        lesson.setSubject(request.subject());
        lesson.setGrade(request.grade());
        lesson.setTitle(request.title());
        lesson.setDescription(request.description());
        lesson.setChapterNumber(request.chapterNumber());
        lesson.setStatus(request.status());

        return LessonResponse.from(lessonRepository.save(lesson));
    }

    @Transactional
    public void delete(UUID id) {
        lessonRepository.delete(findLesson(id));
    }

    private Lesson findLesson(UUID id) {
        return lessonRepository.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException("Lesson not found: " + id)
            );
    }
}