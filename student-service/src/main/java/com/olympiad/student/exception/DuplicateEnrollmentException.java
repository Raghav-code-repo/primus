package com.olympiad.student.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * The student already holds an active enrollment for the requested course.
 *
 * <p>Answered with {@code 409 Conflict}, the same status the student profile
 * endpoints use for a duplicate profile.
 */
public class DuplicateEnrollmentException extends ResponseStatusException {

    public DuplicateEnrollmentException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}
