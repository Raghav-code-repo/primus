package com.olympiad.content.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateLessonRequest(
    @NotNull UUID courseId,
    @NotBlank @Size(max = 150) String subject,
    @NotBlank @Size(max = 50) String grade,
    @NotBlank @Size(max = 255) String title,
    String description,
    @NotNull @Min(1) Integer chapterNumber
) {}