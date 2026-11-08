
package com.olympiad.liveclass.entity;

import com.olympiad.liveclass.enums.LiveClassStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "live_classes")
public class LiveClass {

    @Id
    private UUID id;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Column(name = "teacher_id", nullable = false)
    private UUID teacherId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "scheduled_start", nullable = false)
    private Instant scheduledStart;

    @Column(name = "scheduled_end", nullable = false)
    private Instant scheduledEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LiveClassStatus status = LiveClassStatus.SCHEDULED;

    @Column(name = "room_name", nullable = false, unique = true)
    private String roomName;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * How the current student gained access to this class. Populated only for
     * student-visible listings; null for admin/teacher listings and write
     * responses. Not persisted.
     */
    @Transient
    private String accessSource;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public LiveClass() {
    }

    public UUID getId() { return id; }
    public UUID getCourseId() { return courseId; }
    public UUID getTeacherId() { return teacherId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Instant getScheduledStart() { return scheduledStart; }
    public Instant getScheduledEnd() { return scheduledEnd; }
    public LiveClassStatus getStatus() { return status; }
    public String getRoomName() { return roomName; }

    public void setCourseId(UUID courseId) {
        this.courseId = courseId;
    }

    public void setTeacherId(UUID teacherId) {
        this.teacherId = teacherId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setScheduledStart(Instant scheduledStart) {
        this.scheduledStart = scheduledStart;
    }

    public void setScheduledEnd(Instant scheduledEnd) {
        this.scheduledEnd = scheduledEnd;
    }

    public void setStatus(LiveClassStatus status) {
        this.status = status;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public String getAccessSource() {
        return accessSource;
    }

    public void setAccessSource(String accessSource) {
        this.accessSource = accessSource;
    }
}
