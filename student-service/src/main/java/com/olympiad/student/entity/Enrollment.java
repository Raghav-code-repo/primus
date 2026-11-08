package com.olympiad.student.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Enrollment of a student in a course owned by the Course Service.
 *
 * <p>Only stable identifiers are stored here. The course itself lives in the
 * Course Service database, therefore only the course id is kept in this
 * service and course details are fetched through the Course Service API when
 * they are needed. The student is referenced by the stable Identity Service
 * user id ({@code userId} claim of the JWT), the same convention that
 * {@link Student} uses to link a profile to an Identity account.
 *
 * <p>The database constraint {@code uk_enrollment_student_course} guarantees
 * that a student can never hold two rows for the same course, which is the
 * database level protection against duplicate active enrollments.
 */
@Entity
@Table(
    name = "enrollments",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_enrollment_student_course",
        columnNames = {"identity_user_id", "course_id"}
    ),
    indexes = {
        @Index(name = "idx_enrollment_identity_user_id",
            columnList = "identity_user_id"),
        @Index(name = "idx_enrollment_course_id", columnList = "course_id")
    }
)
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Stable Identity Service user id (the {@code userId} JWT claim).
     */
    @Column(name = "identity_user_id", nullable = false, length = 64)
    private String identityUserId;

    /**
     * Local student profile id. Nullable because a student may enroll before
     * a profile exists; the profile lives in this service only.
     */
    @Column(name = "student_profile_id")
    private Long studentProfileId;

    /**
     * Identifier of the course inside the Course Service.
     */
    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Enrollment() {
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getIdentityUserId() { return identityUserId; }
    public void setIdentityUserId(String identityUserId) {
        this.identityUserId = identityUserId;
    }

    public Long getStudentProfileId() { return studentProfileId; }
    public void setStudentProfileId(Long studentProfileId) {
        this.studentProfileId = studentProfileId;
    }

    public UUID getCourseId() { return courseId; }
    public void setCourseId(UUID courseId) {
        this.courseId = courseId;
    }

    public EnrollmentStatus getStatus() { return status; }
    public void setStatus(EnrollmentStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
