package com.olympiad.student.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * The Course Service could not be reached or did not answer successfully.
 *
 * <p>Answered with {@code 503 Service Unavailable}, an enrollment is never
 * created when the course could not be validated.
 */
public class CourseServiceUnavailableException extends ResponseStatusException {

    public CourseServiceUnavailableException(String message, Throwable cause) {
        super(HttpStatus.SERVICE_UNAVAILABLE, message, cause);
    }
}
