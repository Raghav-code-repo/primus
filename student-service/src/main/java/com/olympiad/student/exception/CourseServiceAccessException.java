package com.olympiad.student.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * The Course Service rejected the service to service call, for example
 * because the configured credentials are not allowed to read courses.
 *
 * <p>Answered with {@code 502 Bad Gateway}.
 */
public class CourseServiceAccessException extends ResponseStatusException {

    public CourseServiceAccessException(String message, Throwable cause) {
        super(HttpStatus.BAD_GATEWAY, message, cause);
    }
}
