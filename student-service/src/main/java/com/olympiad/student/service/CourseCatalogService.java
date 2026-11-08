package com.olympiad.student.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.olympiad.student.client.CourseServiceClient;
import com.olympiad.student.dto.CoursePageResponse;
import com.olympiad.student.dto.CourseSummaryResponse;

/**
 * Read only view on the course catalog of the Course Service.
 *
 * <p>The Student Service never stores courses. The catalog is read through
 * the Course Service API so both services keep their own database.
 */
@Service
@Transactional(readOnly = true)
public class CourseCatalogService {

    /**
     * Default filter of the catalog: only published courses can be enrolled.
     */
    public static final String DEFAULT_STATUS = "PUBLISHED";

    private final CourseServiceClient courseServiceClient;

    public CourseCatalogService(CourseServiceClient courseServiceClient) {
        this.courseServiceClient = courseServiceClient;
    }

    /**
     * Lists the courses of the Course Service.
     *
     * @param status status filter, the published courses are used when the
     *        filter is empty
     * @param subject subject filter, may be null
     * @param page zero based page index
     * @param size page size
     * @param callerToken bearer token of the incoming request, may be null
     */
    public CoursePageResponse list(
            String status,
            String subject,
            int page,
            int size,
            String callerToken) {

        String effectiveStatus =
                (status == null || status.isBlank()) ? DEFAULT_STATUS : status;

        return courseServiceClient.listCourses(
                effectiveStatus, subject, page, size, callerToken);
    }

    /**
     * Returns a single course of the Course Service.
     */
    public CourseSummaryResponse get(UUID courseId, String callerToken) {
        return courseServiceClient.getCourse(courseId, callerToken);
    }
}
