package com.olympiad.identity.controller;

import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rbac-test")
public class RbacTestController {

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('USER_READ')")
    public Map<String, String> readUsers() {
        return Map.of(
                "message", "USER_READ permission granted",
                "resource", "users"
        );
    }

    @GetMapping("/permission-management")
    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public Map<String, String> managePermissions() {
        return Map.of(
                "message", "PERMISSION_MANAGE permission granted"
        );
    }
}