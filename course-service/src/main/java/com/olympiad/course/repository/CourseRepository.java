package com.olympiad.course.repository;

import com.olympiad.course.entity.Course;
import com.olympiad.course.entity.CourseStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CourseRepository
        extends JpaRepository<Course, UUID> {

    boolean existsByCodeIgnoreCase(String code);

    Page<Course> findByStatus(
        CourseStatus status,
        Pageable pageable
    );

    Page<Course> findBySubjectIgnoreCase(
        String subject,
        Pageable pageable
    );
}