package com.olympiad.content.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "content_resources")
public class ContentResource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private ResourceType type;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 1;

    @Column(name = "created_at", nullable = false,
            insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false,
            insertable = false)
    private OffsetDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public Lesson getLesson() { return lesson; }
    public void setLesson(Lesson lesson) { this.lesson = lesson; }
    public ResourceType getType() { return type; }
    public void setType(ResourceType type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}