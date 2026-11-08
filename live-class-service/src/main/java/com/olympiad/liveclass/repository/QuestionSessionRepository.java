
package com.olympiad.liveclass.repository;

import com.olympiad.liveclass.entity.QuestionSession;
import com.olympiad.liveclass.entity.QuestionSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuestionSessionRepository extends JpaRepository<QuestionSession, UUID> {

    List<QuestionSession> findByLiveClassIdOrderByStartedAtDesc(UUID liveClassId);

    List<QuestionSession> findByLiveClassIdAndStatusIn(
            UUID liveClassId, List<QuestionSessionStatus> statuses);

    @Query("SELECT s FROM QuestionSession s WHERE s.liveClassId = ?1 AND s.status = ?2")
    Optional<QuestionSession> findActiveSessionByClassId(UUID liveClassId, QuestionSessionStatus status);

    boolean existsByLiveClassIdAndStatusIn(UUID liveClassId, List<QuestionSessionStatus> statuses);
}
