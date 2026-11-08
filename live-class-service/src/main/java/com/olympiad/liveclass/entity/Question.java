
package com.olympiad.liveclass.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "live_class_questions")
public class Question {

    @Id
    private UUID id;

    @Column(name = "live_class_id")
    private UUID liveClassId;

    @Column(nullable = false, length = 100)
    private String subject;

    @Column(nullable = false, length = 100)
    private String topic;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String statement;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String options;

    @Column(name = "correct_option")
    private Integer correctOption;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        if (id == null) id = UUID.randomUUID();
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Question() {}

    public UUID getId() { return id; }
    public UUID getLiveClassId() { return liveClassId; }
    public String getSubject() { return subject; }
    public String getTopic() { return topic; }
    public String getStatement() { return statement; }
    public String getOptions() { return options; }
    public Integer getCorrectOption() { return correctOption; }
    public String getExplanation() { return explanation; }
    public UUID getCreatedBy() { return createdBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setId(UUID id) { this.id = id; }
    public void setLiveClassId(UUID liveClassId) { this.liveClassId = liveClassId; }
    public void setSubject(String subject) { this.subject = subject; }
    public void setTopic(String topic) { this.topic = topic; }
    public void setStatement(String statement) { this.statement = statement; }
    public void setOptions(String options) { this.options = options; }
    public void setCorrectOption(Integer correctOption) { this.correctOption = correctOption; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
