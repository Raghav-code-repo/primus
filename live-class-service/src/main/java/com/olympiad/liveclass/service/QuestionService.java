
package com.olympiad.liveclass.service;

import com.olympiad.liveclass.client.StudentEnrollmentClient;
import com.olympiad.liveclass.dto.ActiveQuestionView;
import com.olympiad.liveclass.dto.AnswerResponse;
import com.olympiad.liveclass.dto.QuestionResponse;
import com.olympiad.liveclass.dto.QuestionSessionResponse;
import com.olympiad.liveclass.dto.StartQuestionRequest;
import com.olympiad.liveclass.dto.SubmitAnswerRequest;
import com.olympiad.liveclass.dto.StudentQuestionResponse;
import com.olympiad.liveclass.entity.Answer;
import com.olympiad.liveclass.entity.Question;
import com.olympiad.liveclass.entity.QuestionSession;
import com.olympiad.liveclass.entity.QuestionSessionStatus;
import com.olympiad.liveclass.repository.AnswerRepository;
import com.olympiad.liveclass.repository.LiveClassAssignmentRepository;
import com.olympiad.liveclass.repository.LiveClassRepository;
import com.olympiad.liveclass.repository.QuestionRepository;
import com.olympiad.liveclass.repository.QuestionSessionRepository;
import com.olympiad.liveclass.security.LiveClassPrincipal;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
public class QuestionService {

    private static final Logger log =
            LoggerFactory.getLogger(QuestionService.class);

    private final QuestionRepository questionRepository;
    private final QuestionSessionRepository sessionRepository;
    private final AnswerRepository answerRepository;
    private final LiveClassRepository liveClassRepository;
    private final LiveClassAssignmentRepository assignmentRepository;
    private final StudentEnrollmentClient enrollmentClient;
    private final HttpServletRequest request;

    public QuestionService(
            QuestionRepository questionRepository,
            QuestionSessionRepository sessionRepository,
            AnswerRepository answerRepository,
            LiveClassRepository liveClassRepository,
            LiveClassAssignmentRepository assignmentRepository,
            StudentEnrollmentClient enrollmentClient,
            HttpServletRequest request) {
        this.questionRepository = questionRepository;
        this.sessionRepository = sessionRepository;
        this.answerRepository = answerRepository;
        this.liveClassRepository = liveClassRepository;
        this.assignmentRepository = assignmentRepository;
        this.enrollmentClient = enrollmentClient;
        this.request = request;
    }

    /**
     * List questions visible for a class: class-specific questions plus the
     * global question bank. The correct answer is never included here; callers
     * must use {@link #getActiveQuestionForStudent} for student-safe views.
     */
    @Transactional(readOnly = true)
    public List<QuestionResponse> listQuestions(
            UUID liveClassId,
            LiveClassPrincipal principal,
            String bearerToken) {

        requireAuthenticated(principal);

        Set<String> roles = principal.roles();
        boolean isAdmin = roles.contains("ADMIN");
        boolean isTeacher = roles.contains("TEACHER");
        boolean isStudent = roles.contains("STUDENT");

        if (!isAdmin && !isTeacher && !isStudent) {
            throw new AccessDeniedException("You are not authorized to view questions.");
        }

        if (isStudent) {
            UUID studentId = parseUserId(principal.userId());
            ensureStudentCanAccess(liveClassId, studentId, bearerToken);
        } else if (isTeacher && !isAdmin) {
            UUID teacherId = parseUserId(principal.userId());
            if (!questionRepository.findById(liveClassId).isPresent()
                    && !classBelongsToTeacher(liveClassId, teacherId)) {
                throw new AccessDeniedException(
                        "Teachers can only view questions for their own live classes.");
            }
        }

        List<Question> classQuestions = questionRepository.findByLiveClassIdOrderBySubjectAscTopicAsc(liveClassId);
        List<Question> globalQuestions = questionRepository.findGlobalBankQuestions();

        return merge(classQuestions, globalQuestions);
    }

    /**
     * Teacher (or admin) starts a live question session. Only one session may
     * be ACTIVE per class at a time.
     */
    @Transactional
    public QuestionSessionResponse startQuestion(
            UUID liveClassId,
            StartQuestionRequest requestDto,
            LiveClassPrincipal principal,
            String bearerToken) {

        requireAuthenticated(principal);

        Set<String> roles = principal.roles();
        boolean isAdmin = roles.contains("ADMIN");
        boolean isTeacher = roles.contains("TEACHER");

        if (!isAdmin && !isTeacher) {
            throw new AccessDeniedException("Only teachers or administrators can start questions.");
        }

        Question question = questionRepository.findById(requestDto.questionId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Question not found: " + requestDto.questionId()));

        if (!isAdmin) {
            UUID teacherId = parseUserId(principal.userId());
            if (!classBelongsToTeacher(liveClassId, teacherId)) {
                throw new AccessDeniedException(
                        "Teachers can only start questions for their own live classes.");
            }
        }

        // End any currently active session for this class.
        sessionRepository.findByLiveClassIdAndStatusIn(liveClassId,
                List.of(QuestionSessionStatus.ACTIVE)).forEach(s -> {
                    s.setStatus(QuestionSessionStatus.ENDED);
                    sessionRepository.save(s);
                });

        QuestionSession session = new QuestionSession();
        session.setLiveClassId(liveClassId);
        session.setQuestionId(requestDto.questionId());
        session.setStartedBy(parseUserId(principal.userId()));
        session.setStartedAt(Instant.now());
        session.setDurationSeconds(requestDto.durationSeconds());
        session.setEndsAt(Instant.now().plusSeconds(requestDto.durationSeconds()));
        session.setStatus(QuestionSessionStatus.ACTIVE);
        session = sessionRepository.save(session);

        log.info(
                "Question started: classId={}, questionId={}, sessionId={}, startedBy={}, endsAt={}",
                liveClassId, requestDto.questionId(), session.getId(),
                session.getStartedBy(), session.getEndsAt());

        return toSessionResponse(session);
    }

    /**
     * Teacher (or admin) ends the active question session for a class.
     */
    @Transactional
    public QuestionSessionResponse endQuestion(
            UUID liveClassId,
            UUID sessionId,
            LiveClassPrincipal principal) {

        requireAuthenticated(principal);
        QuestionSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Question session not found: " + sessionId));
        if (!session.getLiveClassId().equals(liveClassId)) {
            throw new AccessDeniedException("Session does not belong to this live class.");
        }
        authorizeTeacherOrAdmin(principal, session.getLiveClassId());

        session.setStatus(QuestionSessionStatus.ENDED);
        session = sessionRepository.save(session);
        return toSessionResponse(session);
    }

    /**
     * Teacher (or admin) reveals the correct answer for the active session.
     */
    @Transactional
    public QuestionSessionResponse revealAnswer(
            UUID liveClassId,
            UUID sessionId,
            LiveClassPrincipal principal) {

        requireAuthenticated(principal);
        QuestionSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Question session not found: " + sessionId));
        if (!session.getLiveClassId().equals(liveClassId)) {
            throw new AccessDeniedException("Session does not belong to this live class.");
        }
        authorizeTeacherOrAdmin(principal, session.getLiveClassId());

        if (session.getStatus() != QuestionSessionStatus.ACTIVE) {
            throw new IllegalArgumentException("Only an active question can be revealed.");
        }

        session.setStatus(QuestionSessionStatus.ANSWER_REVEALED);
        session.setAnswerRevealedAt(Instant.now());
        session = sessionRepository.save(session);

        // Mark correctness for all submitted answers.
        UUID questionId = session.getQuestionId();
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Question not found: " + questionId));
        Integer correctOption = question.getCorrectOption();
        List<Answer> answers = answerRepository.findByQuestionSessionId(sessionId);
        for (Answer answer : answers) {
            boolean correct = correctOption != null
                    && correctOption.equals(answer.getOptionIndex());
            answer.setIsCorrect(correct);
            answer.setPointsAwarded(correct ? 1 : 0);
            answerRepository.save(answer);
        }

        return toSessionResponse(session);
    }

    /**
     * Returns the active question session for a class, combined with the
     * question content. The correct answer and explanation are masked (null)
     * for students until the teacher reveals them.
     */
    @Transactional(readOnly = true)
    public ActiveQuestionView getActiveQuestion(
            UUID liveClassId,
            LiveClassPrincipal principal,
            String bearerToken) {

        requireAuthenticated(principal);

        Set<String> roles = principal.roles();
        boolean isAdmin = roles.contains("ADMIN");
        boolean isTeacher = roles.contains("TEACHER");
        boolean isStudent = roles.contains("STUDENT");

        if (!isAdmin && !isTeacher && !isStudent) {
            throw new AccessDeniedException("You are not authorized to view the active question.");
        }

        if (isStudent) {
            UUID studentId = parseUserId(principal.userId());
            ensureStudentCanAccess(liveClassId, studentId, bearerToken);
        } else if (isTeacher && !isAdmin) {
            UUID teacherId = parseUserId(principal.userId());
            if (!classBelongsToTeacher(liveClassId, teacherId)) {
                throw new AccessDeniedException(
                        "Teachers can only view the active question of their own live classes.");
            }
        }

        QuestionSession session = sessionRepository.findByLiveClassIdAndStatusIn(liveClassId,
                List.of(QuestionSessionStatus.ACTIVE, QuestionSessionStatus.ANSWER_REVEALED))
                .stream()
                .findFirst()
                .orElse(null);

        if (session == null) {
            return null;
        }

        Question question = questionRepository.findById(session.getQuestionId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Question not found: " + session.getQuestionId()));

        boolean revealed = session.getStatus() == QuestionSessionStatus.ANSWER_REVEALED;
        boolean maySeeAnswer = isAdmin || isTeacher || revealed;

        List<String> options = parseOptions(question.getOptions());

        return new ActiveQuestionView(
                session.getId(),
                session.getLiveClassId(),
                session.getQuestionId(),
                session.getStartedBy(),
                session.getStartedAt(),
                session.getDurationSeconds(),
                session.getEndsAt(),
                session.getStatus(),
                session.getAnswerRevealedAt(),
                null,
                question.getSubject(),
                question.getTopic(),
                question.getStatement(),
                options,
                maySeeAnswer ? question.getCorrectOption() : null,
                maySeeAnswer ? question.getExplanation() : null
        );
    }

    /**
     * Returns the active question view for STOMP broadcast. The correct answer
     * and explanation are masked unless the session has been revealed; the
     * masking is the same for every participant, so no principal is needed.
     */
    @Transactional(readOnly = true)
    public ActiveQuestionView getActiveQuestionForBroadcast(UUID liveClassId) {
        QuestionSession session = sessionRepository.findByLiveClassIdAndStatusIn(liveClassId,
                List.of(QuestionSessionStatus.ACTIVE, QuestionSessionStatus.ANSWER_REVEALED))
                .stream()
                .findFirst()
                .orElse(null);

        if (session == null) {
            return null;
        }

        Question question = questionRepository.findById(session.getQuestionId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Question not found: " + session.getQuestionId()));

        boolean revealed = session.getStatus() == QuestionSessionStatus.ANSWER_REVEALED;
        List<String> options = parseOptions(question.getOptions());

        return new ActiveQuestionView(
                session.getId(),
                session.getLiveClassId(),
                session.getQuestionId(),
                session.getStartedBy(),
                session.getStartedAt(),
                session.getDurationSeconds(),
                session.getEndsAt(),
                session.getStatus(),
                session.getAnswerRevealedAt(),
                null,
                question.getSubject(),
                question.getTopic(),
                question.getStatement(),
                options,
                revealed ? question.getCorrectOption() : null,
                revealed ? question.getExplanation() : null
        );
    }

    /**
     * Student submits an answer to the active question session.
     */
    @Transactional
    public AnswerResponse submitAnswer(
            UUID liveClassId,
            UUID sessionId,
            SubmitAnswerRequest requestDto,
            LiveClassPrincipal principal,
            String bearerToken) {

        requireAuthenticated(principal);

        Set<String> roles = principal.roles();
        boolean isStudent = roles.contains("STUDENT");
        boolean isAdmin = roles.contains("ADMIN");
        boolean isTeacher = roles.contains("TEACHER");

        if (!isStudent) {
            throw new AccessDeniedException("Only students can submit answers.");
        }

        QuestionSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Question session not found: " + sessionId));
        if (!session.getLiveClassId().equals(liveClassId)) {
            throw new AccessDeniedException("Session does not belong to this live class.");
        }
        if (session.getStatus() != QuestionSessionStatus.ACTIVE) {
            throw new IllegalArgumentException("Answers can only be submitted to an active question.");
        }

        UUID studentId = parseUserId(principal.userId());
        ensureStudentCanAccess(liveClassId, studentId, bearerToken);

        if (answerRepository.existsByQuestionSessionIdAndStudentUserId(sessionId, studentId)) {
            throw new IllegalArgumentException("You have already submitted an answer for this question.");
        }

        Question question = questionRepository.findById(session.getQuestionId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Question not found: " + session.getQuestionId()));
        Integer correctOption = question.getCorrectOption();
        boolean correct = correctOption != null && correctOption.equals(requestDto.optionIndex());

        Answer answer = new Answer();
        answer.setQuestionSessionId(sessionId);
        answer.setStudentUserId(studentId);
        answer.setOptionIndex(requestDto.optionIndex());
        answer.setSubmittedAt(Instant.now());
        answer.setIsCorrect(correct);
        answer.setPointsAwarded(correct ? 1 : 0);
        answer = answerRepository.save(answer);

        log.info(
                "Answer submitted: classId={}, sessionId={}, student={}, optionIndex={}, correct={}",
                liveClassId, sessionId, studentId, requestDto.optionIndex(), correct);

        return toAnswerResponse(answer);
    }

    /* ---------- helpers ---------- */

    private QuestionSession toSession(QuestionSession session) {
        return session;
    }

    private QuestionSessionResponse toSessionResponse(QuestionSession session) {
        return new QuestionSessionResponse(
                session.getId(),
                session.getLiveClassId(),
                session.getQuestionId(),
                session.getStartedBy(),
                session.getStartedAt(),
                session.getDurationSeconds(),
                session.getEndsAt(),
                session.getStatus(),
                session.getAnswerRevealedAt());
    }

    private StudentQuestionResponse toStudentQuestionResponse(QuestionSession session) {
        Question question = questionRepository.findById(session.getQuestionId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Question not found: " + session.getQuestionId()));
        boolean revealed = session.getStatus() == QuestionSessionStatus.ANSWER_REVEALED;
        List<String> options = parseOptions(question.getOptions());
        return new StudentQuestionResponse(
                question.getId(),
                question.getLiveClassId(),
                null,
                question.getSubject(),
                question.getTopic(),
                question.getStatement(),
                options,
                revealed ? question.getExplanation() : null,
                question.getCreatedAt()
        );
    }

    private AnswerResponse toAnswerResponse(Answer answer) {
        return new AnswerResponse(
                answer.getId(),
                answer.getQuestionSessionId(),
                answer.getStudentUserId(),
                answer.getOptionIndex(),
                answer.getSubmittedAt(),
                answer.getIsCorrect(),
                answer.getPointsAwarded());
    }

    private List<QuestionResponse> merge(List<Question> classQuestions, List<Question> globalQuestions) {
        List<QuestionResponse> result = classQuestions.stream()
                .map(this::toQuestionResponse)
                .collect(Collectors.toList());
        result.addAll(globalQuestions.stream()
                .map(this::toQuestionResponse)
                .collect(Collectors.toList()));
        return result;
    }

    private QuestionResponse toQuestionResponse(Question question) {
        List<String> options = parseOptions(question.getOptions());
        return new QuestionResponse(
                question.getId(),
                question.getLiveClassId(),
                null,
                question.getSubject(),
                question.getTopic(),
                question.getStatement(),
                options,
                question.getCorrectOption(),
                question.getExplanation(),
                question.getCreatedAt()
        );
    }

    private List<String> parseOptions(String optionsJson) {
        if (optionsJson == null || optionsJson.isBlank()) {
            return List.of();
        }
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper =
                    new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(optionsJson,
                    mapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception ex) {
            return List.of();
        }
    }

    private boolean classBelongsToTeacher(UUID liveClassId, UUID teacherId) {
        return liveClassRepository.findById(liveClassId)
                .map(lc -> lc.getTeacherId().equals(teacherId))
                .orElse(false);
    }

    private void authorizeTeacherOrAdmin(LiveClassPrincipal principal, UUID liveClassId) {
        Set<String> roles = principal.roles();
        boolean isAdmin = roles.contains("ADMIN");
        boolean isTeacher = roles.contains("TEACHER");
        if (!isAdmin && !isTeacher) {
            throw new AccessDeniedException("Only teachers or administrators can control questions.");
        }
        if (!isAdmin) {
            UUID teacherId = parseUserId(principal.userId());
            if (!classBelongsToTeacher(liveClassId, teacherId)) {
                throw new AccessDeniedException(
                        "Teachers can only control questions for their own live classes.");
            }
        }
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
        var liveClass = liveClassRepository.findById(classId)
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
