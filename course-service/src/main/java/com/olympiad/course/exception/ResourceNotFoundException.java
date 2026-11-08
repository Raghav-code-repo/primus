package com.olympiad.course.exception;

public class ResourceNotFoundException
        extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}