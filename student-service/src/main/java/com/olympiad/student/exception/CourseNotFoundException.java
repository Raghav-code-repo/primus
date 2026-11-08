package com.olympiad.student.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * The requested course does not exist in the Course Service.
 *
 * <p>Answered with {@code 404 Not Found}.
 */
public class CourseNotFoundException extends ResponseStatusException {

    public CourseNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
