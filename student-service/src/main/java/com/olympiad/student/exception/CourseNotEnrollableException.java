package com.olympiad.student.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * The requested course exists but is not eligible for enrollment, for example
 * a draft or an archived course.
 *
 * <p>Answered with {@code 422 Unprocessable Content}.
 */
public class CourseNotEnrollableException extends ResponseStatusException {

    public CourseNotEnrollableException(String message) {
        super(HttpStatus.UNPROCESSABLE_CONTENT, message);
    }
}
