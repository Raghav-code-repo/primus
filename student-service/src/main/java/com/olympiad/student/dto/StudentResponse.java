package com.olympiad.student.dto;

import java.time.LocalDateTime;

import com.olympiad.student.entity.Student;

public record StudentResponse(
        Long id,
        String identityUserId,
        String fullName,
        String grade,
        String schoolName,
        String phone,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static StudentResponse from(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getIdentityUserId(),
                student.getFullName(),
                student.getGrade(),
                student.getSchoolName(),
                student.getPhone(),
                student.getCreatedAt(),
                student.getUpdatedAt()
        );
    }
}