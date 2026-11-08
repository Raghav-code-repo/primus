package com.olympiad.student.dto;

import java.util.List;

/**
 * Page of courses returned by the Course Service.
 *
 * <p>Only the fields the Student Service needs are kept so the response stays
 * stable even if the Course Service changes its pagination representation.
 */
public record CoursePageResponse(
        List<CourseSummaryResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {}
