
package com.olympiad.content.controller;

import com.olympiad.content.dto.CreateLessonRequest;
import com.olympiad.content.dto.LessonResponse;
import com.olympiad.content.dto.UpdateLessonRequest;
import com.olympiad.content.service.LessonService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/content/lessons")
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    /**
     * Create a lesson using the authenticated user's UUID.
     * The JWT subject is an email, so read the userId claim instead.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LessonResponse create(
            @Valid @RequestBody CreateLessonRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        UUID userId = extractUserId(jwt);

        return lessonService.create(request, userId);
    }

    @GetMapping
    public List<LessonResponse> getAll() {
        return lessonService.getAll();
    }

    @GetMapping("/{id}")
    public LessonResponse getById(@PathVariable UUID id) {
        return lessonService.getById(id);
    }

    @GetMapping("/course/{courseId}")
    public List<LessonResponse> getByCourse(
            @PathVariable UUID courseId) {

        return lessonService.getByCourse(courseId);
    }

    @GetMapping("/course/{courseId}/published")
    public List<LessonResponse> getPublishedByCourse(
            @PathVariable UUID courseId) {

        return lessonService.getPublishedByCourse(courseId);
    }

    @PutMapping("/{id}")
    public LessonResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLessonRequest request) {

        return lessonService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        lessonService.delete(id);
    }

    /**
     * Extract the UUID from the userId JWT claim.
     */
    private UUID extractUserId(Jwt jwt) {

        if (jwt == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication token is missing");
        }

        String userIdClaim = jwt.getClaimAsString("userId");

        if (userIdClaim == null || userIdClaim.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "JWT does not contain a userId claim");
        }

        try {
            return UUID.fromString(userIdClaim);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "JWT userId claim is not a valid UUID");
        }
    }
}
