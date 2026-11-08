package com.olympiad.content.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "status", 404,
                "error", "Not Found",
                "message", ex.getMessage()
            )
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(
            MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .findFirst()
            .orElse("Validation failed");

        return ResponseEntity.badRequest().body(
            Map.of("status", 400, "error", message)
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleConflict(
            DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            Map.of(
                "status", 409,
                "error", "Database constraint violation",
                "message", "Check for duplicate chapter numbers or invalid data."
            )
        );
    }
}