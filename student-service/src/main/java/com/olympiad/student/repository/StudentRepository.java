package com.olympiad.student.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.olympiad.student.entity.Student;

public interface StudentRepository
        extends JpaRepository<Student, Long> {

    Optional<Student> findByIdentityUserId(String identityUserId);

    boolean existsByIdentityUserId(String identityUserId);
}