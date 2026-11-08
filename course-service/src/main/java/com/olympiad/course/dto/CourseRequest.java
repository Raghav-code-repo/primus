package com.olympiad.course.dto;

import com.olympiad.course.entity.CourseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CourseRequest(
    @NotBlank
    @Size(max = 30)
    String code,

    @NotBlank
    @Size(max = 150)
    String title,

    @Size(max = 2000)
    String description,

    @NotBlank
    @Size(max = 100)
    String subject,

    @NotBlank
    @Size(max = 50)
    String gradeLevel,

    @NotNull
    CourseStatus status
) {
}