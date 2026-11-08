package com.olympiad.liveclass.repository;

import com.olympiad.liveclass.entity.LiveClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LiveClassRepository
        extends JpaRepository<LiveClass, UUID> {

    List<LiveClass> findByTeacherIdOrderByScheduledStartAsc(
            UUID teacherId);

    List<LiveClass> findByCourseIdOrderByScheduledStartAsc(
            UUID courseId);

    List<LiveClass> findAllByOrderByScheduledStartAsc();

    Optional<LiveClass> findById(UUID id);
}
