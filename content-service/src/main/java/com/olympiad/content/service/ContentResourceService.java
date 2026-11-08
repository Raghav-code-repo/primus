package com.olympiad.content.service;

import com.olympiad.content.dto.ContentResourceResponse;
import com.olympiad.content.dto.CreateResourceRequest;
import com.olympiad.content.entity.ContentResource;
import com.olympiad.content.entity.Lesson;
import com.olympiad.content.exception.ResourceNotFoundException;
import com.olympiad.content.repository.ContentResourceRepository;
import com.olympiad.content.repository.LessonRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ContentResourceService {

    private final ContentResourceRepository resourceRepository;
    private final LessonRepository lessonRepository;

    public ContentResourceService(
            ContentResourceRepository resourceRepository,
            LessonRepository lessonRepository) {
        this.resourceRepository = resourceRepository;
        this.lessonRepository = lessonRepository;
    }

    @Transactional
    public ContentResourceResponse create(
            UUID lessonId, CreateResourceRequest request) {

        Lesson lesson = lessonRepository.findById(lessonId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Lesson not found: " + lessonId)
            );

        ContentResource resource = new ContentResource();
        resource.setLesson(lesson);
        resource.setType(request.type());
        resource.setTitle(request.title());
        resource.setUrl(request.url());
        resource.setDisplayOrder(request.displayOrder());

        return ContentResourceResponse.from(
            resourceRepository.save(resource)
        );
    }

    @Transactional(readOnly = true)
    public List<ContentResourceResponse> getByLesson(UUID lessonId) {
        if (!lessonRepository.existsById(lessonId)) {
            throw new ResourceNotFoundException(
                "Lesson not found: " + lessonId
            );
        }

        return resourceRepository
            .findByLessonIdOrderByDisplayOrderAsc(lessonId)
            .stream()
            .map(ContentResourceResponse::from)
            .toList();
    }

    @Transactional
    public void delete(UUID resourceId) {
        ContentResource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Content resource not found: " + resourceId
            ));

        resourceRepository.delete(resource);
    }
}