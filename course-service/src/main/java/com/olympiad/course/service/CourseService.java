package com.olympiad.course.service;

import com.olympiad.course.dto.CourseRequest;
import com.olympiad.course.dto.CourseResponse;
import com.olympiad.course.entity.Course;
import com.olympiad.course.entity.CourseStatus;
import com.olympiad.course.exception.ResourceNotFoundException;
import com.olympiad.course.repository.CourseRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class CourseService {

    private final CourseRepository repository;

    public CourseService(CourseRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> list(
            CourseStatus status,
            String subject,
            Pageable pageable) {

        Page<Course> courses;

        if (status != null) {
            courses = repository.findByStatus(status, pageable);
        } else if (subject != null && !subject.isBlank()) {
            courses = repository.findBySubjectIgnoreCase(
                subject.trim(), pageable
            );
        } else {
            courses = repository.findAll(pageable);
        }

        return courses.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CourseResponse get(UUID id) {
        return toResponse(findCourse(id));
    }

    public CourseResponse create(CourseRequest request) {
        if (repository.existsByCodeIgnoreCase(request.code().trim())) {
            throw new IllegalArgumentException(
                "A course with this code already exists"
            );
        }

        Course course = new Course();
        apply(course, request);

        return toResponse(repository.save(course));
    }

    public CourseResponse update(
            UUID id,
            CourseRequest request) {

        Course course = findCourse(id);

        boolean codeUsedByAnotherCourse =
            !course.getCode().equalsIgnoreCase(request.code().trim())
            && repository.existsByCodeIgnoreCase(request.code().trim());

        if (codeUsedByAnotherCourse) {
            throw new IllegalArgumentException(
                "A course with this code already exists"
            );
        }

        apply(course, request);

        return toResponse(repository.save(course));
    }

    public void delete(UUID id) {
        Course course = findCourse(id);
        repository.delete(course);
    }

    private Course findCourse(UUID id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Course not found: " + id
            ));
    }

    private void apply(Course course, CourseRequest request) {
        course.setCode(request.code().trim());
        course.setTitle(request.title().trim());
        course.setDescription(request.description());
        course.setSubject(request.subject().trim());
        course.setGradeLevel(request.gradeLevel().trim());
        course.setStatus(request.status());
    }

    private CourseResponse toResponse(Course course) {
        return new CourseResponse(
            course.getId(),
            course.getCode(),
            course.getTitle(),
            course.getDescription(),
            course.getSubject(),
            course.getGradeLevel(),
            course.getStatus(),
            course.getCreatedAt(),
            course.getUpdatedAt()
        );
    }
}