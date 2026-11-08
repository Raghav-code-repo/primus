
package com.olympiad.liveclass.controller;

import com.olympiad.liveclass.dto.ActiveQuestionView;
import com.olympiad.liveclass.dto.AnswerResponse;
import com.olympiad.liveclass.dto.QuestionResponse;
import com.olympiad.liveclass.dto.QuestionSessionResponse;
import com.olympiad.liveclass.dto.StartQuestionRequest;
import com.olympiad.liveclass.dto.SubmitAnswerRequest;
import com.olympiad.liveclass.security.LiveClassPrincipal;
import com.olympiad.liveclass.service.QuestionService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/live-classes")
public class QuestionController {

    private final QuestionService questionService;
    private final SimpMessagingTemplate messagingTemplate;
    private final HttpServletRequest request;

    public QuestionController(
            QuestionService questionService,
            SimpMessagingTemplate messagingTemplate,
            HttpServletRequest request) {
        this.questionService = questionService;
        this.messagingTemplate = messagingTemplate;
        this.request = request;
    }

    /**
     * List the question bank for a class (class questions + global bank).
     * Teacher/admin responses include correctOption; student responses omit it.
     */
    @PreAuthorize("hasAnyAuthority('LIVE_CLASS_QUESTION_READ', 'LIVE_CLASS_QUESTION_CONTROL')")
    @GetMapping("/{classId}/questions")
    public ResponseEntity<?> listQuestions(
            @PathVariable UUID classId,
            @AuthenticationPrincipal LiveClassPrincipal principal) {

        String bearerToken = request.getHeader("Authorization");
        List<QuestionResponse> teacherView =
                questionService.listQuestions(classId, principal, bearerToken);

        if (isStudent(principal)) {
            return ResponseEntity.ok(studentSafe(teacherView));
        }
        return ResponseEntity.ok(teacherView);
    }

    /**
     * Returns the active question session for a class.
     * Students see a safe view (no correct answer/explanation unless revealed).
     */
    @PreAuthorize("hasAnyAuthority('LIVE_CLASS_QUESTION_READ', 'LIVE_CLASS_QUESTION_CONTROL')")
    @GetMapping("/{classId}/questions/active")
    public ResponseEntity<ActiveQuestionView> getActiveQuestion(
            @PathVariable UUID classId,
            @AuthenticationPrincipal LiveClassPrincipal principal) {

        String bearerToken = request.getHeader("Authorization");
        ActiveQuestionView result =
                questionService.getActiveQuestion(classId, principal, bearerToken);
        return ResponseEntity.ok(result);
    }

    /**
     * Teacher/admin starts a live question session.
     */
    @PreAuthorize("hasAuthority('LIVE_CLASS_QUESTION_CONTROL')")
    @PostMapping("/{classId}/questions/start")
    public ResponseEntity<QuestionSessionResponse> startQuestion(
            @PathVariable UUID classId,
            @RequestBody StartQuestionRequest requestDto,
            @AuthenticationPrincipal LiveClassPrincipal principal) {

        String bearerToken = request.getHeader("Authorization");
        QuestionSessionResponse session =
                questionService.startQuestion(classId, requestDto, principal, bearerToken);
        broadcastActiveQuestion(classId);
        return ResponseEntity.ok(session);
    }

    /**
     * Teacher/admin ends the active question session.
     */
    @PreAuthorize("hasAuthority('LIVE_CLASS_QUESTION_CONTROL')")
    @PostMapping("/{classId}/questions/{sessionId}/end")
    public ResponseEntity<QuestionSessionResponse> endQuestion(
            @PathVariable UUID classId,
            @PathVariable UUID sessionId,
            @AuthenticationPrincipal LiveClassPrincipal principal) {

        QuestionSessionResponse session =
                questionService.endQuestion(classId, sessionId, principal);
        broadcastActiveQuestion(classId);
        return ResponseEntity.ok(session);
    }

    /**
     * Teacher/admin reveals the correct answer.
     */
    @PreAuthorize("hasAuthority('LIVE_CLASS_ANSWER_REVEAL')")
    @PostMapping("/{classId}/questions/{sessionId}/reveal")
    public ResponseEntity<QuestionSessionResponse> revealAnswer(
            @PathVariable UUID classId,
            @PathVariable UUID sessionId,
            @AuthenticationPrincipal LiveClassPrincipal principal) {

        QuestionSessionResponse session =
                questionService.revealAnswer(classId, sessionId, principal);
        broadcastActiveQuestion(classId);
        return ResponseEntity.ok(session);
    }

    /**
     * Student submits an answer to the active question session.
     */
    @PreAuthorize("hasAuthority('LIVE_CLASS_ANSWER_SUBMIT')")
    @PostMapping("/{classId}/questions/{sessionId}/answers")
    public ResponseEntity<AnswerResponse> submitAnswer(
            @PathVariable UUID classId,
            @PathVariable UUID sessionId,
            @RequestBody SubmitAnswerRequest requestDto,
            @AuthenticationPrincipal LiveClassPrincipal principal) {

        String bearerToken = request.getHeader("Authorization");
        AnswerResponse answer =
                questionService.submitAnswer(classId, sessionId, requestDto, principal, bearerToken);
        return ResponseEntity.ok(answer);
    }

    private void broadcastActiveQuestion(UUID classId) {
        ActiveQuestionView view = questionService.getActiveQuestionForBroadcast(classId);
        if (view != null) {
            messagingTemplate.convertAndSend(
                    "/topic/live-classes/" + classId + "/questions",
                    view);
        }
    }

    /* ---------- helpers ---------- */

    private boolean isStudent(LiveClassPrincipal principal) {
        return principal != null && principal.roles().contains("STUDENT");
    }

    @SuppressWarnings("unchecked")
    private List<QuestionResponse> studentSafe(List<QuestionResponse> teacherView) {
        return teacherView.stream()
                .map(q -> new QuestionResponse(
                        q.id(),
                        q.liveClassId(),
                        null,
                        q.subject(),
                        q.topic(),
                        q.statement(),
                        q.options(),
                        null,
                        null,
                        q.createdAt()))
                .toList();
    }
}
