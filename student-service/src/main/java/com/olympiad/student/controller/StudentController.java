package com.olympiad.student.controller;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import com.olympiad.student.dto.StudentCreateRequest;
import com.olympiad.student.dto.StudentProfileRequest;
import com.olympiad.student.dto.StudentResponse;
import com.olympiad.student.dto.StudentUpdateRequest;
import com.olympiad.student.entity.Student;
import com.olympiad.student.service.StudentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService service;

    public StudentController(StudentService service) {
        this.service = service;
    }

    /**
     * Admin-provisioned student profile creation.
     * Only callers with {@code ADMIN} or {@code USER_CREATE} may create profiles.
     * The target user's identity is taken from {@code StudentCreateRequest.identityUserId}
     * (trusted admin input for linking to an existing Identity Service account).
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','USER_CREATE')")
    public StudentResponse create(@Valid @RequestBody StudentCreateRequest request) {
        return StudentResponse.from(service.createFromAdminRequest(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','USER_READ')")
    public List<StudentResponse> findAll() {
        return service.findAll().stream()
                .map(StudentResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','USER_READ')")
    public StudentResponse findById(@PathVariable Long id) {
        return StudentResponse.from(service.findById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','USER_UPDATE')")
    public StudentResponse update(
            @PathVariable Long id,
            @Valid @RequestBody StudentUpdateRequest request) {
        Student updated = service.update(id, request);
        return StudentResponse.from(updated);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','USER_DELETE')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    /**
     * Student self-provisioning of their own profile.
     * The identity is derived from the validated JWT claim {@code userId}
     * (see Identity Service {@code JwtService}) and never from the request body.
     */
    @PostMapping("/me")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    public StudentResponse createMyProfile(@Valid @RequestBody StudentProfileRequest request,
                                           @AuthenticationPrincipal Jwt jwt) {
        String identityUserId = jwt.getClaimAsString("userId");
        return StudentResponse.from(service.createForIdentityUser(identityUserId, request));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public StudentResponse getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        String identityUserId = jwt.getClaimAsString("userId");
        Student student = service.findByIdentityUserId(identityUserId);
        return StudentResponse.from(student);
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public StudentResponse updateMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody StudentUpdateRequest request) {
        String identityUserId = jwt.getClaimAsString("userId");
        Student updated = service.updateByIdentityUserId(identityUserId, request);
        return StudentResponse.from(updated);
    }
}