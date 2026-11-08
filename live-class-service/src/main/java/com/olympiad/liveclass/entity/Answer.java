
package com.olympiad.liveclass.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "live_class_answers")
public class Answer {

    @Id
    private UUID id;

    @Column(name = "question_session_id", nullable = false)
    private UUID questionSessionId;

    @Column(name = "student_user_id", nullable = false)
    private UUID studentUserId;

    @Column(name = "option_index")
    private Integer optionIndex;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "points_awarded", nullable = false)
    private Integer pointsAwarded = 0;

    @PrePersist
    void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (submittedAt == null) submittedAt = Instant.now();
    }

    public Answer() {}

    public UUID getId() { return id; }
    public UUID getQuestionSessionId() { return questionSessionId; }
    public UUID getStudentUserId() { return studentUserId; }
    public Integer getOptionIndex() { return optionIndex; }
    public Instant getSubmittedAt() { return submittedAt; }
    public Boolean getIsCorrect() { return isCorrect; }
    public Integer getPointsAwarded() { return pointsAwarded; }

    public void setId(UUID id) { this.id = id; }
    public void setQuestionSessionId(UUID questionSessionId) { this.questionSessionId = questionSessionId; }
    public void setStudentUserId(UUID studentUserId) { this.studentUserId = studentUserId; }
    public void setOptionIndex(Integer optionIndex) { this.optionIndex = optionIndex; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
    public void setIsCorrect(Boolean isCorrect) { this.isCorrect = isCorrect; }
    public void setPointsAwarded(Integer pointsAwarded) { this.pointsAwarded = pointsAwarded; }
}
