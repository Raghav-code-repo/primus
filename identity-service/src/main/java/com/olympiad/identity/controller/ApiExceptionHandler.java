
package com.olympiad.identity.controller;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import com.olympiad.identity.dto.ApiError;
import com.olympiad.identity.exception.ConflictException;
import com.olympiad.identity.exception.ResourceNotFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatus(
            ResponseStatusException ex) {

        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());

        return ResponseEntity.status(status).body(
                new ApiError(
                        Instant.now(),
                        status.value(),
                        ex.getReason() == null
                                ? status.getReasonPhrase()
                                : ex.getReason()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(
            ResourceNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of(
                        "error", "NOT_FOUND",
                        "message", ex.getMessage()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, String>> handleConflict(
            ConflictException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of(
                        "error", "CONFLICT",
                        "message", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new LinkedHashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.putIfAbsent(
                        error.getField(),
                        error.getDefaultMessage() == null
                                ? "Invalid value"
                                : error.getDefaultMessage()));

        return ResponseEntity.badRequest().body(
                Map.of(
                        "error", "VALIDATION_FAILED",
                    "fields", errors));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(
            AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of(
                        "error", "FORBIDDEN",
                        "message", ex.getMessage() == null
                                ? "Access denied"
                                : ex.getMessage()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthentication(
            AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of(
                        "error", "UNAUTHORIZED",
                        "message", ex.getMessage() == null
                                ? "Unauthorized"
                                : ex.getMessage()));
    }
}
