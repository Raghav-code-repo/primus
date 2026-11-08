package com.olympiad.liveclass.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    private UUID id;

    @Column(name = "live_class_id", nullable = false)
    private UUID liveClassId;

    @Column(name = "sender_user_id", nullable = false)
    private UUID senderUserId;

    @Column(name = "recipient_user_id")
    private UUID recipientUserId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }

    public ChatMessage() {}

    public UUID getId() { return id; }
    public UUID getLiveClassId() { return liveClassId; }
    public UUID getSenderUserId() { return senderUserId; }
    public UUID getRecipientUserId() { return recipientUserId; }
    public String getContent() { return content; }
    public Instant getReadAt() { return readAt; }
    public Instant getCreatedAt() { return createdAt; }

    public void setLiveClassId(UUID liveClassId) { this.liveClassId = liveClassId; }
    public void setSenderUserId(UUID senderUserId) { this.senderUserId = senderUserId; }
    public void setRecipientUserId(UUID recipientUserId) { this.recipientUserId = recipientUserId; }
    public void setContent(String content) { this.content = content; }
    public void setReadAt(Instant readAt) { this.readAt = readAt; }
}
