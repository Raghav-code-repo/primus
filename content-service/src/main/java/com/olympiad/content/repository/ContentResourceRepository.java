package com.olympiad.content.repository;

import com.olympiad.content.entity.ContentResource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ContentResourceRepository
        extends JpaRepository<ContentResource, UUID> {

    List<ContentResource> findByLessonIdOrderByDisplayOrderAsc(
        UUID lessonId
    );
}