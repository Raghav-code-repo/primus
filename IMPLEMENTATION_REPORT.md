# Olympiad Live Class — Implementation Report

## 1. Existing Architecture

**Frontend** (`D:\ws\olympiad-identity-ui`): React 19 + TypeScript + Vite + React Router 7 + Axios. Auth via custom Identity JWT (sessionStorage). RBAC via `GET /api/auth/permissions`. Services: Identity 8080, Course 8081, Student 8082, Content 8083, Live Class 8084, Gateway 8088. LiveKit JS SDK 2.23 + `@livekit/components-react` 2.9.24.

**Backend** (`D:\ws\live-class-service`): Spring Boot 4.1.2 / Java 21, JPA+Flyway+PostgreSQL, Spring Security OAuth2 resource server style JWT, WebSocket starter, LiveKit server 0.16.0. Auth filter loads current authorities from Identity Service.

**LiveKit moderation already possible server-side**: `RoomServiceClient` bean exists (`LiveKitConfiguration`), `LiveKitIntegrationService` has createRoom/deleteRoom/generateParticipantToken. But `LiveKitService` (used by controller) hand-rolls JWT with JJWT and grants `canPublish=false` for students (server-authoritative already for publish).

**Data flow**: Frontend → Gateway → Live Class Service (`/api/live-classes/**`) → DB + LiveKit. Token generation at `/api/live-classes/{id}/token`.

## 2. Existing Files That Can Be Extended

Frontend:
- `src/pages/LiveClassRoomPage.tsx` (camera/mic toggles, participant grid, diagnostics)
- `src/api/liveClassApi.ts` (add endpoints)
- `src/auth/permissions.ts` (add new permission constants)
- `src/routes/AppRoutes.tsx` (no new routes needed; classroom page exists)
- `src/api/client.ts` (axios client reusable)

Backend:
- `entity/LiveClass.java`, `repository/LiveClassRepository.java`
- `service/LiveClassService.java`, `service/LiveKitService.java`
- `controller/LiveClassController.java`
- `security/LiveClassJwtAuthenticationFilter.java`, `LiveClassPrincipal.java`
- `integration/service/LiveKitIntegrationService.java`, `LiveKitProperties.java`
- `db/migration/V1__create_live_classes.sql`
- `config/SecurityConfig.java` (WebSocket security)

## 3. Missing Frontend Components

- Private chat panel (student↔teacher) with message list + composer
- Participants list sidebar (with role badges, raised-hand indicator)
- Raise-hand button + teacher queue view
- Olympiad question panel (question text, options, countdown timer display)
- Answer reveal component
- Teacher moderation toolbar (mute mic, restrict camera, restrict screen share, remove participant, restore)
- Screen-share tile handling
- WebSocket client hook (STOMP/SockJS or native) for chat/timer/hand-raise/question events
- Countdown timer component (server-authoritative, displays remaining seconds)

## 4. Missing Java Backend Components

- WebSocket config (STOMP endpoint + message broker) with JWT auth
- Chat message entity/repository/service/controller (or WebSocket handlers)
- Raise-hand state + events
- Olympiad question entity (question, options, correct answer, reveal flag, timer)
- Timer service (server-authoritative countdown, broadcast ticks)
- Answer submission + reveal service
- Moderation service using `RoomServiceClient` (mute track, remove participant, update permissions)
- DTOs for chat/question/raise-hand/moderation
- Flyway migrations V2+
- Permission checks in WebSocket handlers

## 5. Required Database Changes

New tables:
- `chat_messages` (id, live_class_id, sender_user_id, recipient_user_id nullable for broadcast, content, created_at)
- `raised_hands` (id, live_class_id, user_id, raised_at, cleared_at)
- `olympiad_questions` (id, live_class_id, question_text, options JSON, correct_option, timer_seconds, started_at, revealed_at, created_by)
- `question_answers` (id, question_id, user_id, selected_option, submitted_at)
- `participant_permissions` (id, live_class_id, user_id, mic_allowed, camera_allowed, screen_share_allowed) — or store in LiveKit metadata
- Extend `live_classes` with `current_question_id`, `timer_end_at` maybe

## 6. Required RBAC Permissions

Add to Identity Service seed + frontend constants:
- `LIVE_CLASS_CHAT` (or reuse JOIN)
- `LIVE_CLASS_MODERATE` (mute/remove/restrict)
- `LIVE_CLASS_QUESTION_MANAGE` (create/start/reveal questions)
- `LIVE_CLASS_ANSWER` (submit answers)
- `LIVE_CLASS_RAISE_HAND`

Map: TEACHER/ADMIN → moderate + question manage; STUDENT → chat + answer + raise hand.

## 7. WebSocket Integration Requirements

- Endpoint `/ws/live-class` (STOMP) with JWT via query/header
- Topics: `/topic/class/{id}/chat`, `/topic/class/{id}/participants`, `/topic/class/{id}/hand`, `/topic/class/{id}/question`, `/topic/class/{id}/timer`, `/topic/class/{id}/moderation`
- User queues for private chat: `/user/queue/chat`
- Message types: chat, raise-hand, lower-hand, question-start, timer-tick, question-reveal, moderation-action
- Server validates sender identity and permissions on each message
- CORS/origin config

## 8. LiveKit Server-Side Moderation Requirements

Use `RoomServiceClient` + `Egress` not needed. Operations:
- `mutePublishedTrack(room, identity, trackSid, muted)` for mic mute
- `removeParticipant(room, identity)` for removal
- `updateParticipant(room, identity, metadata/permission)` or re-issue token with restricted grants for camera/screen-share restriction
- `sendData` for in-room signaling if needed
- Participant metadata to reflect raised hand / role
- Token grants: add `canPublishSources` to restrict to mic/camera/screen; re-issue token on permission change (LiveKit supports participant permission updates via server API)

## 9. Risks and Dependencies

- LiveKit server API version compatibility (0.16.0) — verify mute/remove/participant update methods exist
- Student list/enrollment: `LiveClassService.getVisibleClasses` returns empty for students; need enrollment integration or join-by-class access
- No Redis; timer state in-memory (single instance) or DB; horizontal scaling risk
- WebSocket auth must reuse JWT filter logic
- Frontend has no WebSocket lib installed — need STOMP client (e.g. `@stomp/stompjs`) — dependency addition justified
- Screen sharing not currently implemented in UI
- Chat persistence vs ephemeral
- Timer drift: server broadcasts remaining seconds

## 10. Exact Implementation Order

1. Add RBAC permissions (Identity seed + frontend constants).
2. DB migrations V2 (chat, questions, answers, raised hands, permissions).
3. Backend entities/repositories/services/controllers for chat + questions + answers + raise hand.
4. WebSocket config + STOMP handlers with JWT auth.
5. Timer service (server-authoritative) + broadcast.
6. Moderation service via RoomServiceClient (mute/remove/restrict/restore).
7. LiveKit token grants: per-role publish + screen share; re-issue on moderation.
8. Frontend: WebSocket hook + chat panel + participants list + raise hand.
9. Frontend: question panel + countdown timer + answer reveal.
10. Frontend: teacher moderation toolbar wired to backend endpoints.
11. Tests + integration.
12. Gateway routes already cover `/api/live-classes/**`; WebSocket path may need gateway route if used through gateway.
