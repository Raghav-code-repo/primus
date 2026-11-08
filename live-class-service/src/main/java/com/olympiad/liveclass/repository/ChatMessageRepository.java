package com.olympiad.liveclass.repository;

import com.olympiad.liveclass.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByLiveClassIdAndSenderUserIdOrRecipientUserIdOrderByCreatedAtAsc(
            UUID liveClassId, UUID userId1, UUID userId2);
    List<ChatMessage> findByLiveClassIdOrderByCreatedAtAsc(UUID liveClassId);
}
