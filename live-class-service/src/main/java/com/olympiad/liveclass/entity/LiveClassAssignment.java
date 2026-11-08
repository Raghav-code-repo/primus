
package com.olympiad.liveclass.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.util.UUID;

/**
 * Explicit assignment of a student to a live class.
 *
 * <p>The table is created by Flyway migration {@code V4__live_class_assignments.sql}.
 * Only stable identifiers are stored: the live class id and the student id, where the
 * student id is the stable Identity Service user id ({@code userId} JWT claim), the same
 * convention used by the Identity Service and the Student Service.
 */
@Entity
@Table(
    name = "live_class_assignments",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_live_class_assignments_student",
        columnNames = {"live_class_id", "student_id"}
    )
)
public class LiveClassAssignment {

    @Id
    private UUID id;

    @Column(name = "live_class_id", nullable = false)
    private UUID liveClassId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "assigned_by", nullable = false)
    private UUID assignedBy;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt;

    @Column(nullable = false, length = 20)
    private String status = "ASSIGNED";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public LiveClassAssignment() {
    }

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        Instant now = Instant.now();
        if (assignedAt == null) {
            assignedAt = now;
        }
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getLiveClassId() {
        return liveClassId;
    }

    public void setLiveClassId(UUID liveClassId) {
        this.liveClassId = liveClassId;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public void setStudentId(UUID studentId) {
        this.studentId = studentId;
    }

    public UUID getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(UUID assignedBy) {
        this.assignedBy = assignedBy;
    }

    public Instant getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(Instant assignedAt) {
        this.assignedAt = assignedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
