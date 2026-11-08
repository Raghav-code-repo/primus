package com.olympiad.student.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.olympiad.student.entity.Enrollment;
import com.olympiad.student.entity.EnrollmentStatus;

public interface EnrollmentRepository
        extends JpaRepository<Enrollment, Long> {

    Optional<Enrollment> findByIdentityUserIdAndCourseId(
            String identityUserId, UUID courseId);

    boolean existsByIdentityUserIdAndCourseIdAndStatus(
            String identityUserId, UUID courseId, EnrollmentStatus status);

    List<Enrollment> findByIdentityUserIdOrderByCreatedAtDesc(
            String identityUserId);

    List<Enrollment> findByIdentityUserIdAndCourseIdOrderByCreatedAtDesc(
            String identityUserId, UUID courseId);

    List<Enrollment> findByCourseIdOrderByCreatedAtDesc(UUID courseId);

    List<Enrollment> findAllByOrderByCreatedAtDesc();
}
