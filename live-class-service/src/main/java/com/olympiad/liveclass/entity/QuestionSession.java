
package com.olympiad.liveclass.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "live_class_question_sessions")
public class QuestionSession {

    @Id
    private UUID id;

    @Column(name = "live_class_id", nullable = false)
    private UUID liveClassId;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "started_by", nullable = false)
    private UUID startedBy;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds = 300;

    @Column(name = "ends_at")
    private Instant endsAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QuestionSessionStatus status = QuestionSessionStatus.NOT_STARTED;

    @Column(name = "answer_revealed_at")
    private Instant answerRevealedAt;

    @PrePersist
    void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (startedAt == null) startedAt = Instant.now();
    }

    public QuestionSession() {}

    public UUID getId() { return id; }
    public UUID getLiveClassId() { return liveClassId; }
    public UUID getQuestionId() { return questionId; }
    public UUID getStartedBy() { return startedBy; }
    public Instant getStartedAt() { return startedAt; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public Instant getEndsAt() { return endsAt; }
    public QuestionSessionStatus getStatus() { return status; }
    public Instant getAnswerRevealedAt() { return answerRevealedAt; }

    public void setId(UUID id) { this.id = id; }
    public void setLiveClassId(UUID liveClassId) { this.liveClassId = liveClassId; }
    public void setQuestionId(UUID questionId) { this.questionId = questionId; }
    public void setStartedBy(UUID startedBy) { this.startedBy = startedBy; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    public void setEndsAt(Instant endsAt) { this.endsAt = endsAt; }
    public void setStatus(QuestionSessionStatus status) { this.status = status; }
    public void setAnswerRevealedAt(Instant answerRevealedAt) { this.answerRevealedAt = answerRevealedAt; }
}
