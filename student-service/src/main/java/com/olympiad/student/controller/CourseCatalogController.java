package com.olympiad.student.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.olympiad.student.dto.CoursePageResponse;
import com.olympiad.student.dto.CourseSummaryResponse;
import com.olympiad.student.security.CurrentUserSupport;
import com.olympiad.student.service.CourseCatalogService;

/**
 * Course catalog of the Student Service.
 *
 * <p>The courses are owned by the Course Service, this controller only
 * forwards the read requests so a student can browse the courses from a
 * single place before creating an enrollment.
 */
@RestController
@RequestMapping("/api/courses")
public class CourseCatalogController {

    private final CourseCatalogService service;

    public CourseCatalogController(CourseCatalogService service) {
        this.service = service;
    }

    /**
     * Lists the courses, by default only the published ones.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public CoursePageResponse list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String subject,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal Jwt jwt) {

        if (page < 0 || size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page must be non-negative and size must be between 1 and 100");
        }

        return service.list(
                status, subject, page, size, CurrentUserSupport.token(jwt));
    }

    /**
     * Returns a single course.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public CourseSummaryResponse get(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {

        return service.get(id, CurrentUserSupport.token(jwt));
    }
}
