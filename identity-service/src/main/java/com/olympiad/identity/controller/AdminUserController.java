package com.olympiad.identity.controller;

import java.security.Principal;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.olympiad.identity.dto.request.CreateUserRequest;
import com.olympiad.identity.dto.request.UpdateUserRequest;
import com.olympiad.identity.dto.request.UpdateUserStatusRequest;
import com.olympiad.identity.service.AdminUserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    // List users
    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok(adminUserService.listUsers());
    }

    // Get user by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_READ')")
    public ResponseEntity<?> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(adminUserService.getUser(id));
    }

    // Create a user
    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminUserService.createUser(request));
    }

    // Update first and last name
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<?> updateUser(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(adminUserService.updateUser(id, request));
    }

    // Activate, deactivate, or lock an account
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<?> updateUserStatus(@PathVariable UUID id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            Principal principal) {
        String actorEmail = principal == null ? null : principal.getName();
        return ResponseEntity.ok(adminUserService.updateStatus(id, request.status(), actorEmail));
    }
}
