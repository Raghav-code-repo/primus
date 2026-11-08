
package com.olympiad.liveclass.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.olympiad.liveclass.exception.ApiError;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class ApiSecurityHandlers
        implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public ApiSecurityHandlers(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    // No token, invalid authentication, or expired token
    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {

        writeError(
                request,
                response,
                HttpServletResponse.SC_UNAUTHORIZED,
                "Unauthorized",
                "Authentication is required or the access token is invalid."
        );
    }

    // Authenticated user lacks the required permission
    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException exception
    ) throws IOException {

        writeError(
                request,
                response,
                HttpServletResponse.SC_FORBIDDEN,
                "Forbidden",
                "You do not have permission to perform this action."
        );
    }

    private void writeError(
            HttpServletRequest request,
            HttpServletResponse response,
            int status,
            String error,
            String message
    ) throws IOException {

        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiError apiError = ApiError.of(
                status,
                error,
                message,
                request.getRequestURI()
        );

        objectMapper.writeValue(
                response.getOutputStream(),
                apiError
        );
    }
}
