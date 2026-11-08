package com.olympiad.course.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "courses",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_courses_code",
            columnNames = "code"
        )
    }
)
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 30)
    private String code;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, length = 100)
    private String subject;

    @Column(nullable = false, length = 50)
    private String gradeLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CourseStatus status = CourseStatus.DRAFT;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    public Course() {
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

    public UUID getId() { return id; }
    public String getCode() { return code; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getSubject() { return subject; }
    public String getGradeLevel() { return gradeLevel; }
    public CourseStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setCode(String code) { this.code = code; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) {
        this.description = description;
    }
    public void setSubject(String subject) {
        this.subject = subject;
    }
    public void setGradeLevel(String gradeLevel) {
        this.gradeLevel = gradeLevel;
    }
    public void setStatus(CourseStatus status) {
        this.status = status;
    }
}