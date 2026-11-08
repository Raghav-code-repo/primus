
package com.olympiad.liveclass.controller;

import com.olympiad.liveclass.dto.ChatMessageResponse;
import com.olympiad.liveclass.dto.SendChatMessageRequest;
import com.olympiad.liveclass.entity.LiveClass;
import com.olympiad.liveclass.repository.LiveClassRepository;
import com.olympiad.liveclass.security.LiveClassAuthentication;
import com.olympiad.liveclass.security.LiveClassPrincipal;
import com.olympiad.liveclass.security.StompAuthChannelInterceptor;
import com.olympiad.liveclass.service.ChatService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/live-classes")
public class ChatController {

    private final ChatService chatService;
    private final StompAuthChannelInterceptor stompAuth;
    private final HttpServletRequest request;
    private final LiveClassRepository liveClassRepository;

    public ChatController(
            ChatService chatService,
            StompAuthChannelInterceptor stompAuth,
            HttpServletRequest request,
            LiveClassRepository liveClassRepository) {
        this.chatService = chatService;
        this.stompAuth = stompAuth;
        this.request = request;
        this.liveClassRepository = liveClassRepository;
    }

    /**
     * WebSocket: client sends {@code /app/live-classes/{classId}/chat}.
     * Delivered privately to the recipient and echoed back to the sender.
     */
    @MessageMapping("/live-classes/{classId}/chat")
    public void sendMessage(
            @DestinationVariable UUID classId,
            @Payload SendChatMessageRequest requestDto,
            StompHeaderAccessor accessor) {

        LiveClassAuthentication auth = userAuthentication(accessor);
        if (auth == null) {
            throw new org.springframework.security.access.AccessDeniedException("Not authenticated.");
        }

        SendChatMessageRequest normalized = new SendChatMessageRequest(
                classId,
                requestDto.recipientUserId(),
                requestDto.content()
        );

        String bearerToken = stompAuth.getBearerToken(accessor.getSessionId());
        chatService.sendMessage(normalized, auth.getPrincipal(), bearerToken);
    }

    /**
     * HTTP: conversation history between the authenticated user and the other
     * party. Students omit {@code with} (defaults to the class teacher);
     * teachers supply {@code with} = the student id.
     */
    @PreAuthorize("hasAnyAuthority('LIVE_CLASS_CHAT_READ', 'LIVE_CLASS_CHAT_SEND')")
    @GetMapping("/{classId}/chat")
    public ResponseEntity<List<ChatMessageResponse>> listMessages(
            @PathVariable UUID classId,
            @RequestParam(required = false) UUID with) {

        LiveClassPrincipal principal = userPrincipal();
        String bearerToken = request.getHeader("Authorization");
        UUID otherUserId = resolveOtherUserId(classId, with, principal);
        List<ChatMessageResponse> messages =
                chatService.listMessages(classId, otherUserId, principal, bearerToken);
        return ResponseEntity.ok(messages);
    }

    @PreAuthorize("hasAnyAuthority('LIVE_CLASS_CHAT_READ', 'LIVE_CLASS_CHAT_SEND')")
    @PostMapping("/{classId}/chat/{messageId}/read")
    public ResponseEntity<ChatMessageResponse> markRead(
            @PathVariable UUID classId,
            @PathVariable UUID messageId,
            @AuthenticationPrincipal LiveClassPrincipal principal) {

        String bearerToken = request.getHeader("Authorization");
        ChatMessageResponse updated =
                chatService.markRead(classId, messageId, principal);
        return ResponseEntity.ok(updated);
    }

    /* ---------- helpers ---------- */

    private LiveClassPrincipal userPrincipal() {
        org.springframework.security.core.Authentication security =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (security == null || security.getPrincipal() == null) {
            throw new org.springframework.security.access.AccessDeniedException("Not authenticated.");
        }
        Object principal = security.getPrincipal();
        if (principal instanceof LiveClassAuthentication auth) {
            return auth.getPrincipal();
        }
        if (principal instanceof LiveClassPrincipal p) {
            return p;
        }
        throw new org.springframework.security.access.AccessDeniedException("Not authenticated.");
    }

    private LiveClassAuthentication userAuthentication(StompHeaderAccessor accessor) {
        Object user = accessor.getUser();
        if (user instanceof LiveClassAuthentication auth) {
            return auth;
        }
        org.springframework.security.core.Authentication security =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (security instanceof LiveClassAuthentication auth) {
            return auth;
        }
        return null;
    }

    private UUID resolveOtherUserId(UUID classId, UUID with, LiveClassPrincipal principal) {
        if (with != null) {
            return with;
        }
        boolean isStudent = principal.roles().contains("STUDENT");
        if (isStudent) {
            LiveClass liveClass = liveClassRepository.findById(classId)
                    .orElseThrow(() ->
                            new org.springframework.security.access.AccessDeniedException(
                                    "Live class not found: " + classId));
            return liveClass.getTeacherId();
        }
        throw new org.springframework.security.access.AccessDeniedException(
                "Teachers and administrators must specify the student id with the 'with' parameter.");
    }
}
