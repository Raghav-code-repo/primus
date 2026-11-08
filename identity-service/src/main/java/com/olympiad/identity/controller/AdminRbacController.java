
package com.olympiad.identity.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.olympiad.identity.service.AdminRbacService;

@RestController
@RequestMapping("/api/admin")
public class AdminRbacController {

    private final AdminRbacService adminRbacService;

    public AdminRbacController(AdminRbacService adminRbacService) {
        this.adminRbacService = adminRbacService;
    }

    // List all roles
    @GetMapping("/roles")
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public ResponseEntity<?> getRoles() {
        return ResponseEntity.ok(adminRbacService.getRoles());
    }

    // Create a role
    @PostMapping("/roles")
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public ResponseEntity<?> createRole(
            @RequestBody Map<String, String> request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminRbacService.createRole(request));
    }

    // List all permissions
    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public ResponseEntity<?> getPermissions() {
        return ResponseEntity.ok(adminRbacService.getPermissions());
    }

    // Create a permission
    @PostMapping("/permissions")
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public ResponseEntity<?> createPermission(
            @RequestBody Map<String, String> request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminRbacService.createPermission(request));
    }

    // Assign a permission to a role
    @PostMapping("/roles/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public ResponseEntity<?> assignPermission(
            @PathVariable UUID roleId,
            @PathVariable UUID permissionId) {

        adminRbacService.assignPermission(roleId, permissionId);
        return ResponseEntity.ok(
                Map.of("message", "Permission assigned successfully"));
    }

    // Revoke a permission from a role
    @DeleteMapping("/roles/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public ResponseEntity<?> revokePermission(
            @PathVariable UUID roleId,
            @PathVariable UUID permissionId) {

        adminRbacService.revokePermission(roleId, permissionId);
        return ResponseEntity.ok(
                Map.of("message", "Permission revoked successfully"));
    }

    // Assign a role to a user
    @PostMapping("/users/{userId}/roles/{roleId}")
    @PreAuthorize("hasAuthority('ROLE_ASSIGN')")
    public ResponseEntity<?> assignRole(
            @PathVariable UUID userId,
            @PathVariable UUID roleId) {

        adminRbacService.assignRole(userId, roleId);
        return ResponseEntity.ok(
                Map.of("message", "Role assigned successfully"));
    }

    // Revoke a role from a user
    @DeleteMapping("/users/{userId}/roles/{roleId}")
    @PreAuthorize("hasAuthority('ROLE_ASSIGN')")
    public ResponseEntity<?> revokeRole(
            @PathVariable UUID userId,
            @PathVariable UUID roleId) {

        adminRbacService.revokeRole(userId, roleId);
        return ResponseEntity.ok(
                Map.of("message", "Role revoked successfully"));
    }
}
