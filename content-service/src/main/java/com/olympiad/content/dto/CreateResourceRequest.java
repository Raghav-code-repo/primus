package com.olympiad.content.dto;

import com.olympiad.content.entity.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateResourceRequest(
    @NotNull ResourceType type,
    @NotBlank @Size(max = 255) String title,
    @NotBlank String url,
    @NotNull @Min(1) Integer displayOrder
) {}