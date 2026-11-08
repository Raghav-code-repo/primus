
package com.olympiad.liveclass.repository;

import com.olympiad.liveclass.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnswerRepository extends JpaRepository<Answer, UUID> {

    Optional<Answer> findByQuestionSessionIdAndStudentUserId(
            UUID questionSessionId, UUID studentUserId);

    List<Answer> findByQuestionSessionId(UUID questionSessionId);

    boolean existsByQuestionSessionIdAndStudentUserId(
            UUID questionSessionId, UUID studentUserId);
}
