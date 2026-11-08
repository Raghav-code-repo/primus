package com.olympiad.content.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "lessons",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_lesson_course_chapter",
        columnNames = {"course_id", "chapter_number"}
    )
)
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Column(nullable = false, length = 150)
    private String subject;

    @Column(nullable = false, length = 50)
    private String grade;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "chapter_number", nullable = false)
    private Integer chapterNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LessonStatus status = LessonStatus.DRAFT;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false,
            insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false,
            insertable = false)
    private OffsetDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getCourseId() { return courseId; }
    public void setCourseId(UUID courseId) { this.courseId = courseId; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) {
        this.description = description;
    }
    public Integer getChapterNumber() { return chapterNumber; }
    public void setChapterNumber(Integer chapterNumber) {
        this.chapterNumber = chapterNumber;
    }
    public LessonStatus getStatus() { return status; }
    public void setStatus(LessonStatus status) { this.status = status; }
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}