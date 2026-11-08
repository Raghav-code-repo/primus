package com.olympiad.course.controller;

import com.olympiad.course.dto.CourseRequest;
import com.olympiad.course.dto.CourseResponse;
import com.olympiad.course.entity.CourseStatus;
import com.olympiad.course.service.CourseService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService service;

    public CourseController(CourseService service) {
        this.service = service;
    }

    @GetMapping
    public Page<CourseResponse> list(
            @RequestParam(required = false) CourseStatus status,
            @RequestParam(required = false) String subject,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (page < 0 || size < 1 || size > 100) {
            throw new IllegalArgumentException(
                "Page must be non-negative and size must be between 1 and 100"
            );
        }

        Pageable pageable = PageRequest.of(
            page, size, Sort.by("createdAt").descending()
        );

        return service.list(status, subject, pageable);
    }

    @GetMapping("/{id}")
    public CourseResponse get(@PathVariable UUID id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CourseResponse create(
            @Valid @RequestBody CourseRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public CourseResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody CourseRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}