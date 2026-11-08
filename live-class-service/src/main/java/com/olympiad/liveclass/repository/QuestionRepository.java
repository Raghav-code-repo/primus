
package com.olympiad.liveclass.repository;

import com.olympiad.liveclass.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, UUID> {

    List<Question> findByLiveClassIdOrderBySubjectAscTopicAsc(UUID liveClassId);

    @Query("SELECT q FROM Question q WHERE q.liveClassId IS NULL ORDER BY q.subject ASC, q.topic ASC")
    List<Question> findGlobalBankQuestions();

    boolean existsByIdAndCreatedBy(UUID id, UUID createdBy);
}
