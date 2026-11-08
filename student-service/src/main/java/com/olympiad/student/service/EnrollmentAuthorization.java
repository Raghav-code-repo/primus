package com.olympiad.student.service;

import java.util.Set;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.olympiad.student.entity.Enrollment;
import com.olympiad.student.repository.EnrollmentRepository;
import com.olympiad.student.security.CurrentUserSupport;

/**
 * Authorization rules for the enrollment endpoints.
 *
 * <p>The bean is referenced from the controller with
 * {@code @PreAuthorize("@enrollmentAuthorization...")}, therefore the bean
 * name is fixed to {@code enrollmentAuthorization}.
 *
 * <p>A student may only reach their own enrollments. Administrators may
 * manage every enrollment, but only with the authorities that already exist
 * in the RBAC of the Identity Service.
 */
@Component("enrollmentAuthorization")
public class EnrollmentAuthorization {

    /** Authorities that allow administrative management of enrollments. */
    private static final Set<String> ADMIN_AUTHORITIES = Set.of(
            "ADMIN", "ROLE_ADMIN",
            "ENROLLMENT_READ", "ENROLLMENT_CANCEL", "ENROLLMENT_MANAGE");

    private final EnrollmentRepository enrollmentRepository;

    public EnrollmentAuthorization(EnrollmentRepository enrollmentRepository) {
        this.enrollmentRepository = enrollmentRepository;
    }

    /**
     * Returns true when the caller owns the enrollment or is allowed to
     * manage it.
     */
    public boolean canAccess(Authentication authentication, Long enrollmentId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        if (isAdmin(authentication)) {
            return true;
        }

        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElse(null);

        if (enrollment == null) {
            // Let the service answer with 404 for unknown identifiers.
            return true;
        }

        String callerUserId = CurrentUserSupport.userId(authentication);

        if (callerUserId == null) {
            return false;
        }

        return callerUserId.equals(enrollment.getIdentityUserId());
    }

    /**
     * Returns true when the caller holds an administrative authority.
     */
    public boolean isAdmin(Authentication authentication) {
        return CurrentUserSupport.hasAnyAuthority(
                authentication,
                ADMIN_AUTHORITIES.toArray(new String[0]));
    }
}
