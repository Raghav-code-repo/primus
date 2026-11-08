package com.olympiad.content.controller;

import com.olympiad.content.dto.ContentResourceResponse;
import com.olympiad.content.dto.CreateResourceRequest;
import com.olympiad.content.service.ContentResourceService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/content/lessons/{lessonId}/resources")
public class ContentResourceController {

    private final ContentResourceService resourceService;

    public ContentResourceController(
            ContentResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContentResourceResponse create(
            @PathVariable UUID lessonId,
            @Valid @RequestBody CreateResourceRequest request) {
        return resourceService.create(lessonId, request);
    }

    @GetMapping
    public List<ContentResourceResponse> getByLesson(
            @PathVariable UUID lessonId) {
        return resourceService.getByLesson(lessonId);
    }
}