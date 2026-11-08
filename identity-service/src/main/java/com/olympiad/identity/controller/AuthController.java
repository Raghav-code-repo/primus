package com.olympiad.identity.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.olympiad.identity.dto.AuthResponse;
import com.olympiad.identity.dto.LoginRequest;
import com.olympiad.identity.dto.RegisterRequest;
import com.olympiad.identity.dto.request.ChangePasswordRequest;
import com.olympiad.identity.dto.request.ForgotPasswordRequest;
import com.olympiad.identity.dto.request.ResetPasswordRequest;
import com.olympiad.identity.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserProfile> me(
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(
                authService.getProfile(authentication.getName()));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        authService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(java.util.Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        authService.forgotPassword(request);
        return ResponseEntity.ok(java.util.Map.of(
                "message", "If an account exists with that email, a password reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request);
        return ResponseEntity.ok(java.util.Map.of("message", "Password reset successfully"));
    }
}