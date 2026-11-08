package com.olympiad.course.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail notFound(
            ResourceNotFoundException ex) {

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND, ex.getMessage()
        );
        problem.setTitle("Resource not found");
        problem.setType(URI.create(
            "https://olympiad.example/problems/not-found"
        ));
        return problem;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail badRequest(
            IllegalArgumentException ex) {

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST, ex.getMessage()
        );
        problem.setTitle("Invalid request");
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail validationError(
            MethodArgumentNotValidException ex) {

        String detail = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error ->
                error.getField() + ": " + error.getDefaultMessage()
            )
            .distinct()
            .reduce((a, b) -> a + "; " + b)
            .orElse("Request validation failed");

        return ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST, detail
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail dataConflict() {
        return ProblemDetail.forStatusAndDetail(
            HttpStatus.CONFLICT,
            "The request conflicts with existing course data"
        );
    }
}