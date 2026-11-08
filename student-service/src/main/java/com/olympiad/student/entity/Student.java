package com.olympiad.student.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(
    name = "students",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_student_identity_user",
        columnNames = "identity_user_id"
    )
)
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "identity_user_id", nullable = false, unique = true)
    private String identityUserId;

    @NotBlank
    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String grade;
    private String schoolName;
    private String phone;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Student() {}

    public Long getId() { return id; }
    public String getIdentityUserId() { return identityUserId; }
    public void setIdentityUserId(String identityUserId) {
        this.identityUserId = identityUserId;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}