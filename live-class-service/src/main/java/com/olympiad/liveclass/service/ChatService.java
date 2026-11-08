
package com.olympiad.liveclass.service;

import com.olympiad.liveclass.client.StudentEnrollmentClient;
import com.olympiad.liveclass.dto.ChatMessageResponse;
import com.olympiad.liveclass.dto.SendChatMessageRequest;
import com.olympiad.liveclass.entity.ChatMessage;
import com.olympiad.liveclass.entity.LiveClass;
import com.olympiad.liveclass.repository.ChatMessageRepository;
import com.olympiad.liveclass.repository.LiveClassAssignmentRepository;
import com.olympiad.liveclass.repository.LiveClassRepository;
import com.olympiad.liveclass.security.LiveClassPrincipal;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger log =
            LoggerFactory.getLogger(ChatService.class);

    private final LiveClassRepository liveClassRepository;
    private final LiveClassAssignmentRepository assignmentRepository;
    private final ChatMessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final StudentEnrollmentClient enrollmentClient;
    private final HttpServletRequest request;

    public ChatService(
            LiveClassRepository liveClassRepository,
            LiveClassAssignmentRepository assignmentRepository,
            ChatMessageRepository messageRepository,
            SimpMessagingTemplate messagingTemplate,
            StudentEnrollmentClient enrollmentClient,
            HttpServletRequest request) {
        this.liveClassRepository = liveClassRepository;
        this.assignmentRepository = assignmentRepository;
        this.messageRepository = messageRepository;
        this.messagingTemplate = messagingTemplate;
        this.enrollmentClient = enrollmentClient;
        this.request = request;
    }

    /**
     * Persist a private chat message and deliver it only to the authorized
     * recipient. The sender is derived from the authenticated principal and is
     * never trusted from the client.
     */
    @Transactional
    public ChatMessageResponse sendMessage(
            SendChatMessageRequest requestDto,
            LiveClassPrincipal principal,
            String bearerToken) {

        requireAuthenticated(principal);

        LiveClass liveClass = liveClassRepository.findById(requestDto.liveClassId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Live class not found: " + requestDto.liveClassId()));

        UUID senderId = parseUserId(principal.userId());
        Set<String> roles = principal.roles();
        boolean isAdmin = roles.contains("ADMIN");
        boolean isTeacher = roles.contains("TEACHER");
        boolean isStudent = roles.contains("STUDENT");

        if (!isAdmin && !isTeacher && !isStudent) {
            throw new AccessDeniedException("You are not authorized to send chat messages.");
        }

        UUID recipientUserId = requestDto.recipientUserId();

        if (isStudent) {
            UUID studentId = senderId;
            ensureStudentCanAccess(liveClass.getId(), studentId, bearerToken);
            // A student may only message the teacher of the class. When the
            // client does not specify a recipient, default to the teacher.
            if (recipientUserId == null) {
                recipientUserId = liveClass.getTeacherId();
            }
            if (!recipientUserId.equals(liveClass.getTeacherId())) {
                throw new AccessDeniedException(
                        "Students may only message the teacher of this live class.");
            }
        } else if (isTeacher && !isAdmin) {
            UUID teacherId = senderId;
            if (!teacherId.equals(liveClass.getTeacherId())) {
                throw new AccessDeniedException(
                        "Teachers can only message students of their own live classes.");
            }
            if (recipientUserId == null) {
                throw new IllegalArgumentException("A recipient is required for private chat.");
            }
            if (!assignmentRepository.existsByLiveClassIdAndStudentId(liveClass.getId(), recipientUserId)) {
                throw new AccessDeniedException(
                        "That student is not assigned to this live class.");
            }
        } else if (recipientUserId == null) {
            throw new IllegalArgumentException("A recipient is required for private chat.");
        }

        ChatMessage message = new ChatMessage();
        message.setLiveClassId(liveClass.getId());
        message.setSenderUserId(senderId);
        message.setRecipientUserId(recipientUserId);
        message.setContent(requestDto.content());
        message = messageRepository.save(message);

        log.info(
                "Chat message: classId={}, sender={}, recipient={}, messageId={}",
                liveClass.getId(), senderId, recipientUserId, message.getId());

        ChatMessageResponse response = toResponse(message, principal);

        messagingTemplate.convertAndSendToUser(
                recipientUserId.toString(), "/queue/live-class-chat", response);
        messagingTemplate.convertAndSendToUser(
                senderId.toString(), "/queue/live-class-chat", response);

        log.debug(
                "Chat message delivered: classId={}, messageId={}, recipient={}, senderEcho={}",
                liveClass.getId(), message.getId(), recipientUserId, senderId
        );

        return response;
    }

    /**
     * Conversation history between the authenticated user and the other party
     * within the given live class.
     */
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> listMessages(
            UUID liveClassId,
            UUID otherUserId,
            LiveClassPrincipal principal,
            String bearerToken) {

        requireAuthenticated(principal);

        LiveClass liveClass = liveClassRepository.findById(liveClassId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Live class not found: " + liveClassId));

        UUID userId = parseUserId(principal.userId());
        Set<String> roles = principal.roles();
        boolean isAdmin = roles.contains("ADMIN");
        boolean isTeacher = roles.contains("TEACHER");
        boolean isStudent = roles.contains("STUDENT");

        if (!isAdmin && !isTeacher && !isStudent) {
            throw new AccessDeniedException("You are not authorized to view chat history.");
        }

        if (isStudent) {
            ensureStudentCanAccess(liveClassId, userId, bearerToken);
            if (!otherUserId.equals(liveClass.getTeacherId())) {
                throw new AccessDeniedException(
                        "Students may only view conversations with the teacher.");
            }
        } else if (isTeacher && !isAdmin) {
            UUID teacherId = userId;
            if (!teacherId.equals(liveClass.getTeacherId())) {
                throw new AccessDeniedException(
                        "Teachers can only view conversations of their own live classes.");
            }
            if (!assignmentRepository.existsByLiveClassIdAndStudentId(liveClassId, otherUserId)) {
                throw new AccessDeniedException(
                        "That student is not assigned to this live class.");
            }
        }

        List<ChatMessage> messages = messageRepository
                .findByLiveClassIdAndSenderUserIdOrRecipientUserIdOrderByCreatedAtAsc(
                        liveClassId, userId, otherUserId);

        return messages.stream()
                .map(m -> toResponse(m, principal, principal.roles()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChatMessageResponse markRead(
            UUID liveClassId, UUID messageId, LiveClassPrincipal principal) {

        requireAuthenticated(principal);
        ChatMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found: " + messageId));
        if (!message.getLiveClassId().equals(liveClassId)) {
            throw new AccessDeniedException("Message does not belong to this live class.");
        }
        UUID userId = parseUserId(principal.userId());
        if (!message.getRecipientUserId().equals(userId)) {
            throw new AccessDeniedException("You can only mark your own messages as read.");
        }
        message.setReadAt(Instant.now());
        messageRepository.save(message);
        return toResponse(message, principal, principal.roles());
    }

    private ChatMessageResponse toResponse(ChatMessage message, LiveClassPrincipal principal) {
        return toResponse(message, principal, principal.roles());
    }

    private ChatMessageResponse toResponse(
            ChatMessage message, LiveClassPrincipal principal, Set<String> roleNames) {

        UUID userId = parseUserId(principal.userId());
        boolean isSender = message.getSenderUserId().equals(userId);
        String senderName = isSender ? "You" : "Participant";

        return new ChatMessageResponse(
                message.getId(),
                message.getLiveClassId(),
                message.getSenderUserId(),
                senderName,
                message.getRecipientUserId(),
                message.getContent(),
                message.getCreatedAt(),
                message.getReadAt() != null
        );
    }

    private void requireAuthenticated(LiveClassPrincipal principal) {
        if (principal == null || principal.userId() == null || principal.email() == null) {
            throw new AccessDeniedException("A valid authenticated user is required");
        }
    }

    private UUID parseUserId(String userId) {
        try {
            return UUID.fromString(userId);
        } catch (RuntimeException ex) {
            throw new AccessDeniedException("Authenticated user ID is invalid");
        }
    }

    private void ensureStudentCanAccess(UUID classId, UUID studentId, String bearerToken) {
        LiveClass liveClass = liveClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Live class not found: " + classId));
        boolean assigned = assignmentRepository.existsByLiveClassIdAndStudentId(classId, studentId);
        boolean enrolled = enrolledCourseIds(bearerToken).contains(liveClass.getCourseId());
        if (!assigned && !enrolled) {
            throw new AccessDeniedException("The student is not assigned to this live class");
        }
    }

    private Set<UUID> enrolledCourseIds(String bearerToken) {
        try {
            return enrollmentClient.enrolledCourseIds(bearerToken);
        } catch (Exception ex) {
            return Set.of();
        }
    }
}
