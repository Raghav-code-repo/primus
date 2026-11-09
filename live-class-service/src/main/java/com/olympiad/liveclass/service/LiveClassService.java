
package com.olympiad.liveclass.service;

import com.olympiad.liveclass.client.StudentEnrollmentClient;
import com.olympiad.liveclass.integration.node.NodeClassroomClient;
import com.olympiad.liveclass.dto.CreateLiveClassRequest;
import com.olympiad.liveclass.dto.JoinLiveClassResponse;
import com.olympiad.liveclass.dto.RaisedHandResponse;
import com.olympiad.liveclass.dto.UpdateLiveClassRequest;
import com.olympiad.liveclass.exception.ResourceNotFoundException;
import com.olympiad.liveclass.entity.LiveClass;
import com.olympiad.liveclass.entity.RaisedHand;
import com.olympiad.liveclass.enums.LiveClassStatus;
import com.olympiad.liveclass.repository.LiveClassAssignmentRepository;
import com.olympiad.liveclass.repository.LiveClassRepository;
import com.olympiad.liveclass.repository.RaisedHandRepository;
import com.olympiad.liveclass.security.LiveClassPrincipal;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class LiveClassService {

    private static final Logger log =
            LoggerFactory.getLogger(LiveClassService.class);

    private final LiveClassRepository repository;
    private final LiveClassAssignmentRepository assignmentRepository;
    private final RaisedHandRepository raisedHandRepository;
    private final StudentEnrollmentClient enrollmentClient;
    private final HttpServletRequest request;

    private final NodeClassroomClient nodeClassroomClient;

    public LiveClassService(
            LiveClassRepository repository,
            LiveClassAssignmentRepository assignmentRepository,
            RaisedHandRepository raisedHandRepository,
            StudentEnrollmentClient enrollmentClient,
            NodeClassroomClient nodeClassroomClient,
            HttpServletRequest request) {
        this.repository = repository;
        this.assignmentRepository = assignmentRepository;
        this.raisedHandRepository = raisedHandRepository;
        this.enrollmentClient = enrollmentClient;
        this.nodeClassroomClient = nodeClassroomClient;
        this.request = request;
    }

    /**
     * Create a live class.
     * Teachers can create classes only for themselves.
     * Administrators can assign a class to a specified teacher.
     */
    @Transactional
    public LiveClass create(
            CreateLiveClassRequest request,
            LiveClassPrincipal principal) {

        requireAuthenticated(principal);

        Set<String> roles = principal.roles();
        boolean isAdmin = roles.contains("ADMIN");
        boolean isTeacher = roles.contains("TEACHER");

        if (!isAdmin && !isTeacher) {
            throw new AccessDeniedException(
                    "Only teachers or administrators can create live classes");
        }

        if (request.scheduledStart() == null
                || request.scheduledEnd() == null
                || !request.scheduledEnd().isAfter(request.scheduledStart())) {
            throw new IllegalArgumentException(
                    "End time must be after start time");
        }

        UUID teacherId;

        if (isAdmin) {
            if (request.teacherId() == null) {
                throw new IllegalArgumentException(
                        "Administrator must specify a teacher ID");
            }
            teacherId = request.teacherId();
        } else {
            // Never trust the teacherId submitted by a teacher.
            teacherId = parseUserId(principal.userId());
        }

        LiveClass liveClass = new LiveClass();
        liveClass.setCourseId(request.courseId());
        liveClass.setTeacherId(teacherId);
        liveClass.setTitle(request.title());
        liveClass.setDescription(request.description());
        liveClass.setScheduledStart(request.scheduledStart());
        liveClass.setScheduledEnd(request.scheduledEnd());
        liveClass.setStatus(LiveClassStatus.SCHEDULED);
        liveClass.setRoomName("class-" + UUID.randomUUID());

        return repository.save(liveClass);
    }

    /**
     * Return classes visible to the authenticated user.
     */
    @Transactional(readOnly = true)
    public List<LiveClass> getVisibleClasses(
            LiveClassPrincipal principal) {

        requireAuthenticated(principal);

        Set<String> roles = principal.roles();

        if (roles.contains("ADMIN")) {
            return repository.findAllByOrderByScheduledStartAsc();
        }

        if (roles.contains("TEACHER")) {
            UUID teacherId = parseUserId(principal.userId());

            return repository.findByTeacherIdOrderByScheduledStartAsc(
                    teacherId);
        }

        if (roles.contains("STUDENT")) {
            UUID studentId = parseUserId(principal.userId());
            Set<UUID> assignedClassIds =
                    new HashSet<>(assignmentRepository.findLiveClassIdByStudentId(studentId));
            String bearer = request.getHeader(HttpHeaders.AUTHORIZATION);
            Set<UUID> enrolledCourseIds = enrolledCourseIds(bearer);

            return repository.findAllByOrderByScheduledStartAsc().stream()
                    .filter(liveClass ->
                            assignedClassIds.contains(liveClass.getId())
                                    || enrolledCourseIds.contains(liveClass.getCourseId()))
                    .peek(liveClass -> liveClass.setAccessSource(
                            assignedClassIds.contains(liveClass.getId())
                                    ? "ASSIGNED"
                                    : "ENROLLED_COURSE"))
                    .toList();
        }

        throw new AccessDeniedException(
                "You are not authorized to view live classes");
    }

    /**
     * Return one class while enforcing ownership and visibility.
     */
    @Transactional(readOnly = true)
    public LiveClass getVisibleById(
            UUID id,
            LiveClassPrincipal principal) {

        requireAuthenticated(principal);

        LiveClass liveClass = findClass(id);
        Set<String> roles = principal.roles();

        if (roles.contains("ADMIN")) {
            return liveClass;
        }

        if (roles.contains("TEACHER")) {
            UUID teacherId = parseUserId(principal.userId());

            if (teacherId.equals(liveClass.getTeacherId())) {
                return liveClass;
            }

            throw new AccessDeniedException(
                    "Teachers can access only their own live classes");
        }

        if (roles.contains("STUDENT")) {
            UUID studentId = parseUserId(principal.userId());
            ensureStudentCanAccess(id, studentId);
            return liveClass;
        }

        throw new AccessDeniedException(
                "You are not authorized to view this live class");
    }

    /**
     * Validate permissions, ownership and the join window.
     *
     * This method does not issue a LiveKit or other meeting-provider token.
     */
    @Transactional(readOnly = true)
    public JoinLiveClassResponse joinClass(
            UUID classId,
            LiveClassPrincipal principal) {

        requireAuthenticated(principal);

        LiveClass liveClass = findClass(classId);
        Set<String> roles = principal.roles();

        boolean isAdmin = roles.contains("ADMIN");
        boolean isTeacher = roles.contains("TEACHER");
        boolean isStudent = roles.contains("STUDENT");

        log.info(
                "Join request: email={}, userId={}, roles={}, classId={}, classTeacherId={}",
                principal.email(),
                principal.userId(),
                roles,
                classId,
                liveClass.getTeacherId()
        );

        if (!isAdmin && !isTeacher && !isStudent) {
            throw new AccessDeniedException(
                    "You are not authorized to join this class");
        }

        // Teachers can join only their own classes, unless they are admins.
        if (isTeacher && !isAdmin) {
            UUID teacherId = parseUserId(principal.userId());

            if (!teacherId.equals(liveClass.getTeacherId())) {
                throw new AccessDeniedException(
                        "Teachers can join only their own live classes");
            }
        }

        /*
         * A user with both STUDENT and TEACHER roles is handled as a teacher
         * above. Student-only users are verified to be assigned to the class
         * (explicitly or through an enrolled course) before the time window
         * checks below.
         */
        if (isStudent) {
            UUID studentId = parseUserId(principal.userId());
            ensureStudentCanAccess(classId, studentId);
        }

        Instant now = Instant.now();

        // Joining opens 10 minutes before the scheduled start.
        Instant joinOpensAt =
                liveClass.getScheduledStart().minusSeconds(600);

        if (now.isBefore(joinOpensAt)) {
            throw new AccessDeniedException(
                    "The live class join window has not opened yet");
        }

        if (!now.isBefore(liveClass.getScheduledEnd())) {
            throw new AccessDeniedException(
                    "The live class has already ended");
        }

        if (liveClass.getStatus() == LiveClassStatus.CANCELLED) {
            throw new AccessDeniedException(
                    "This live class has been cancelled");
        }

        String participantRole = isAdmin
                ? "ADMIN"
                : isTeacher ? "TEACHER" : "STUDENT";

        try {
            nodeClassroomClient.createOrGetSession(liveClass.getId().toString());
        } catch (Exception e) {
            // Do not fail join if Node.js classroom service is unavailable.
        }

        return new JoinLiveClassResponse(
                liveClass.getId(),
                liveClass.getRoomName(),
                principal.email(),
                participantRole,
                now,
                "Access and time checks passed. Meeting token issuance is not configured."
        );
    }

    /**
     * Update a live class. Only the teacher who owns it or an admin can update.
     * Cannot update a class that is already LIVE or COMPLETED or CANCELLED.
     */
    @Transactional
    public LiveClass update(UUID id, UpdateLiveClassRequest request, LiveClassPrincipal principal) {
        requireAuthenticated(principal);

        LiveClass liveClass = findClass(id);
        Set<String> roles = principal.roles();
        boolean isAdmin = roles.contains("ADMIN");
        boolean isTeacher = roles.contains("TEACHER");

        if (isTeacher && !isAdmin) {
            UUID teacherId = parseUserId(principal.userId());
            if (!teacherId.equals(liveClass.getTeacherId())) {
                throw new AccessDeniedException("Teachers can update only their own live classes");
            }
        } else if (!isAdmin) {
            throw new AccessDeniedException("You are not authorized to update this live class");
        }

        if (liveClass.getStatus() == LiveClassStatus.LIVE || liveClass.getStatus() == LiveClassStatus.COMPLETED || liveClass.getStatus() == LiveClassStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot update a live class that is not SCHEDULED");
        }

        if (request.title() != null && !request.title().isBlank()) {
            liveClass.setTitle(request.title());
        }
        if (request.description() != null) {
            liveClass.setDescription(request.description());
        }
        if (request.scheduledStart() != null) {
            liveClass.setScheduledStart(request.scheduledStart());
        }
        if (request.scheduledEnd() != null) {
            liveClass.setScheduledEnd(request.scheduledEnd());
        }
        if (request.scheduledStart() != null && request.scheduledEnd() != null) {
            if (!request.scheduledEnd().isAfter(request.scheduledStart())) {
                throw new IllegalArgumentException("End time must be after start time");
            }
        } else if ((request.scheduledStart() != null && liveClass.getScheduledEnd() != null && !liveClass.getScheduledEnd().isAfter(request.scheduledStart()))
                || (request.scheduledEnd() != null && liveClass.getScheduledStart() != null && !request.scheduledEnd().isAfter(liveClass.getScheduledStart()))) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        return repository.save(liveClass);
    }

    /**
     * Cancel a live class.
     */
    @Transactional
    public LiveClass cancel(UUID id, LiveClassPrincipal principal) {
        requireAuthenticated(principal);

        LiveClass liveClass = findClass(id);
        Set<String> roles = principal.roles();
        boolean isAdmin = roles.contains("ADMIN");
        boolean isTeacher = roles.contains("TEACHER");

        if (isTeacher && !isAdmin) {
            UUID teacherId = parseUserId(principal.userId());
            if (!teacherId.equals(liveClass.getTeacherId())) {
                throw new AccessDeniedException("Teachers can cancel only their own live classes");
            }
        } else if (!isAdmin) {
            throw new AccessDeniedException("You are not authorized to cancel this live class");
        }

        if (liveClass.getStatus() == LiveClassStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot cancel a completed live class");
        }

        liveClass.setStatus(LiveClassStatus.CANCELLED);
        return repository.save(liveClass);
    }

    /* ---------- Raised hands ---------- */

    /**
     * A student raises their hand in the class. The student must be assigned to
     * (or enrolled in) the class. A student may have at most one active raised
     * hand per class.
     */
    @Transactional
    public RaisedHandResponse raiseHand(UUID classId, LiveClassPrincipal principal) {
        requireAuthenticated(principal);

        Set<String> roles = principal.roles();
        if (!roles.contains("STUDENT")) {
            throw new AccessDeniedException("Only students can raise a hand.");
        }

        UUID studentId = parseUserId(principal.userId());
        ensureStudentCanAccess(classId, studentId);

        findClass(classId);

        Optional<RaisedHand> active = raisedHandRepository.findByLiveClassIdOrderByRaisedAtAsc(classId).stream()
                .filter(h -> h.getUserId().equals(studentId) && h.getClearedAt() == null)
                .findFirst();
        if (active.isPresent()) {
            return toResponse(active.get());
        }

        RaisedHand hand = new RaisedHand();
        hand.setLiveClassId(classId);
        hand.setUserId(studentId);
        hand.setAccepted(false);
        hand = raisedHandRepository.save(hand);
        return toResponse(hand);
    }

    /**
     * The authenticated student lowers their own active hand in the class.
     */
    @Transactional
    public void lowerHand(UUID classId, LiveClassPrincipal principal) {
        requireAuthenticated(principal);

        Set<String> roles = principal.roles();
        if (!roles.contains("STUDENT")) {
            throw new AccessDeniedException("Only students can lower their own hand.");
        }

        UUID studentId = parseUserId(principal.userId());
        List<RaisedHand> hands = raisedHandRepository.findByLiveClassIdOrderByRaisedAtAsc(classId);
        for (RaisedHand hand : hands) {
            if (hand.getUserId().equals(studentId) && hand.getClearedAt() == null) {
                hand.setClearedAt(Instant.now());
                raisedHandRepository.save(hand);
            }
        }
    }

    /**
     * Returns the currently active raised hands for a class. Only the teacher
     * who owns the class (or an administrator) may view the queue.
     */
    @Transactional(readOnly = true)
    public List<RaisedHandResponse> listRaisedHands(UUID classId, LiveClassPrincipal principal) {
        requireAuthenticated(principal);
        requireTeacherOrAdmin(classId, principal);

        List<RaisedHand> hands = raisedHandRepository.findByLiveClassIdOrderByRaisedAtAsc(classId);
        return hands.stream()
                .filter(h -> h.getClearedAt() == null)
                .map(this::toResponse)
                .toList();
    }

    /**
     * The teacher accepts a student's raised hand.
     */
    @Transactional
    public void acceptRaisedHand(UUID classId, UUID userId, LiveClassPrincipal principal) {
        requireAuthenticated(principal);
        requireTeacherOrAdmin(classId, principal);

        List<RaisedHand> hands = raisedHandRepository.findByLiveClassIdOrderByRaisedAtAsc(classId);
        for (RaisedHand hand : hands) {
            if (hand.getUserId().equals(userId) && hand.getClearedAt() == null) {
                hand.setAccepted(true);
                raisedHandRepository.save(hand);
            }
        }
    }

    /**
     * The teacher lowers a student's raised hand.
     */
    @Transactional
    public void lowerRaisedHand(UUID classId, UUID userId, LiveClassPrincipal principal) {
        requireAuthenticated(principal);
        requireTeacherOrAdmin(classId, principal);

        List<RaisedHand> hands = raisedHandRepository.findByLiveClassIdOrderByRaisedAtAsc(classId);
        for (RaisedHand hand : hands) {
            if (hand.getUserId().equals(userId) && hand.getClearedAt() == null) {
                hand.setClearedAt(Instant.now());
                raisedHandRepository.save(hand);
            }
        }
    }

    private void requireTeacherOrAdmin(UUID classId, LiveClassPrincipal principal) {
        LiveClass liveClass = findClass(classId);
        Set<String> roles = principal.roles();
        boolean isAdmin = roles.contains("ADMIN");
        boolean isTeacher = roles.contains("TEACHER");
        if (!isAdmin && !isTeacher) {
            throw new AccessDeniedException("Only teachers and administrators can manage raised hands.");
        }
        if (isTeacher && !isAdmin) {
            UUID teacherId = parseUserId(principal.userId());
            if (!teacherId.equals(liveClass.getTeacherId())) {
                throw new AccessDeniedException("Teachers can manage raised hands only in their own live classes.");
            }
        }
    }

    private RaisedHandResponse toResponse(RaisedHand hand) {
        return new RaisedHandResponse(
                hand.getId(),
                hand.getLiveClassId(),
                hand.getUserId(),
                hand.getRaisedAt(),
                hand.isAccepted()
        );
    }

    /**
     * Verifies that the given student may see or join the given live class.
     * A student may access a class when it is explicitly assigned to them or
     * when it belongs to one of their actively enrolled courses.
     */
    public void ensureStudentCanAccess(UUID classId, UUID studentId) {
        String bearer = request.getHeader(HttpHeaders.AUTHORIZATION);
        ensureStudentCanAccess(classId, studentId, bearer);
    }

    /**
     * Token-aware variant for WebSocket/STOMP contexts where no
     * {@link jakarta.servlet.http.HttpServletRequest} is available.
     */
    public void ensureStudentCanAccess(UUID classId, UUID studentId, String bearerToken) {
        LiveClass liveClass = findClass(classId);
        boolean assigned = assignmentRepository.existsByLiveClassIdAndStudentId(classId, studentId);
        boolean enrolled = enrolledCourseIds(bearerToken).contains(liveClass.getCourseId());
        if (!assigned && !enrolled) {
            throw new AccessDeniedException(
                    "The student is not assigned to this live class");
        }
    }

    private void ensureStudentCanAccess(
            LiveClass liveClass, UUID studentId, String bearerToken) {
        boolean assigned = assignmentRepository
                .existsByLiveClassIdAndStudentId(liveClass.getId(), studentId);
        boolean enrolled = enrolledCourseIds(bearerToken).contains(liveClass.getCourseId());
        if (!assigned && !enrolled) {
            throw new AccessDeniedException(
                    "The student is not assigned to this live class");
        }
    }

    /**
     * Returns the ids of the courses the bearer-token subject is actively
     * enrolled in. Failures degrade to an empty set so visibility falls back
     * to explicit assignments only.
     */
    private Set<UUID> enrolledCourseIds(String bearerToken) {
        try {
            return enrollmentClient.enrolledCourseIds(bearerToken);
        } catch (Exception ex) {
            return Set.of();
        }
    }

    public LiveClass findClass(UUID id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Live class not found: " + id));
    }

    private void requireAuthenticated(LiveClassPrincipal principal) {
        if (principal == null
                || principal.userId() == null
                || principal.email() == null
                || principal.roles() == null) {
            throw new AccessDeniedException(
                    "A valid authenticated user is required");
        }
    }

    private UUID parseUserId(String userId) {
        try {
            return UUID.fromString(userId);
        } catch (RuntimeException ex) {
            throw new AccessDeniedException(
                    "Authenticated user ID is invalid");
        }
    }
}
