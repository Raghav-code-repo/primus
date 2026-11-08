package com.olympiad.student.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.olympiad.student.dto.EnrollmentCreateRequest;
import com.olympiad.student.dto.EnrollmentResponse;
import com.olympiad.student.security.CurrentUserSupport;
import com.olympiad.student.service.EnrollmentResult;
import com.olympiad.student.service.EnrollmentService;

import jakarta.validation.Valid;

/**
 * Enrollment endpoints.
 *
 * <p>Self service endpoints derive the student identity from the validated
 * JWT ({@code userId} claim). The request body never carries an identity, so
 * a student can only ever act on their own enrollments.
 */
@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService service;

    public EnrollmentController(EnrollmentService service) {
        this.service = service;
    }

    /**
     * Enrolls the authenticated student in an existing course.
     *
     * <p>The course is validated against the Course Service before the
     * enrollment is stored. A duplicate active enrollment is rejected with
     * {@code 409 Conflict}, an unknown course with {@code 404 Not Found} and
     * an unreachable Course Service with {@code 503 Service Unavailable}.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EnrollmentResponse> create(
            @Valid @RequestBody EnrollmentCreateRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        String identityUserId = CurrentUserSupport.userId(jwt);

        EnrollmentResult result = service.enroll(
                identityUserId,
                request.courseId(),
                CurrentUserSupport.token(jwt));

        HttpStatus status = result.created()
                ? HttpStatus.CREATED
                : HttpStatus.OK;

        return ResponseEntity.status(status)
                .body(EnrollmentResponse.from(result.enrollment()));
    }

    /**
     * Lists the enrollments of the authenticated student.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public List<EnrollmentResponse> findMine(
            @AuthenticationPrincipal Jwt jwt) {

        String identityUserId = CurrentUserSupport.userId(jwt);

        return service.findByIdentityUserId(identityUserId).stream()
                .map(EnrollmentResponse::from)
                .toList();
    }

    /**
     * Administrative listing of all enrollments, optionally filtered by
     * student identity or course.
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN','ROLE_ADMIN','ENROLLMENT_READ')")
    public List<EnrollmentResponse> findAll(
            @RequestParam(required = false) String identityUserId,
            @RequestParam(required = false) UUID courseId) {

        return service.findAll(identityUserId, courseId).stream()
                .map(EnrollmentResponse::from)
                .toList();
    }

    /**
     * Returns a single enrollment. Students may only read their own
     * enrollment, administrators may read any enrollment.
     */
    @GetMapping("/{id}")
    @PreAuthorize("@enrollmentAuthorization.canAccess(authentication, #id)")
    public EnrollmentResponse findById(@PathVariable Long id) {
        return EnrollmentResponse.from(service.findById(id));
    }

    /**
     * Cancels an enrollment. Students may only cancel their own
     * enrollment, administrators may cancel any enrollment.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@enrollmentAuthorization.canAccess(authentication, #id)")
    public void cancel(@PathVariable Long id) {
        service.cancel(id);
    }
}
