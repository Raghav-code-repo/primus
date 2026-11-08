package com.olympiad.student.client;

import java.util.UUID;

import com.olympiad.student.dto.CoursePageResponse;
import com.olympiad.student.dto.CourseSummaryResponse;

/**
 * Read only access to the Course Service catalog.
 *
 * <p>The Student Service never writes courses, it only reads them to validate
 * that a course exists and is eligible for enrollment.
 */
public interface CourseServiceClient {

    /**
     * Fetches a single course.
     *
     * @param courseId identifier of the course in the Course Service
     * @param callerToken bearer token of the incoming request, may be null
     * @throws com.olympiad.student.exception.CourseNotFoundException
     *         when the course does not exist
     * @throws com.olympiad.student.exception.CourseServiceUnavailableException
     *         when the Course Service cannot be reached
     * @throws com.olympiad.student.exception.CourseServiceAccessException
     *         when the Course Service rejects the credentials
     */
    CourseSummaryResponse getCourse(UUID courseId, String callerToken);

    /**
     * Lists the courses of the Course Service.
     *
     * @param status optional status filter, may be null
     * @param subject optional subject filter, may be null
     * @param page zero based page index
     * @param size page size
     * @param callerToken bearer token of the incoming request, may be null
     */
    CoursePageResponse listCourses(
            String status,
            String subject,
            int page,
            int size,
            String callerToken);
}
