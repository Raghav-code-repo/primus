
package com.olympiad.liveclass.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "raised_hands")
public class RaisedHand {

    @Id
    private UUID id;

    @Column(name = "live_class_id", nullable = false)
    private UUID liveClassId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "raised_at", nullable = false)
    private Instant raisedAt;

    @Column(name = "cleared_at")
    private Instant clearedAt;

    @Column(nullable = false)
    private boolean accepted;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (raisedAt == null) {
            raisedAt = Instant.now();
        }
    }

    public RaisedHand() {}

    public UUID getId() { return id; }
    public UUID getLiveClassId() { return liveClassId; }
    public UUID getUserId() { return userId; }
    public Instant getRaisedAt() { return raisedAt; }
    public Instant getClearedAt() { return clearedAt; }
    public boolean isAccepted() { return accepted; }

    public void setLiveClassId(UUID liveClassId) { this.liveClassId = liveClassId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public void setRaisedAt(Instant raisedAt) { this.raisedAt = raisedAt; }
    public void setClearedAt(Instant clearedAt) { this.clearedAt = clearedAt; }
    public void setAccepted(boolean accepted) { this.accepted = accepted; }
}
