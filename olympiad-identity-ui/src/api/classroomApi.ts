
import { liveClassClient } from './client'
import { getAccessToken } from '../auth/tokenStorage'

import type {
  ChatMessage,
  ActiveQuestionView,
  OlympiadQuestion,
  AnswerResult,
  QuestionSession,
  QuestionStats,
  RaisedHand,
  RaisedHandResponse,
  CreateQuestionRequest,
  UpdateQuestionRequest,
} from '../types/classroom'

import { Client } from '@stomp/stompjs'

const WS_URL =
  import.meta.env.VITE_LIVE_CLASS_WS_URL ?? 'ws://localhost:8084/live-class-ws'

let stompClient: Client | null = null
let stompPromise: Promise<Client> | null = null

interface ChatMessageBackend {
  id: string
  liveClassId: string
  senderUserId: string
  senderName: string
  recipientUserId: string
  content: string
  createdAt: string
  read: boolean
}

function toChatMessage(backend: ChatMessageBackend): ChatMessage {
  const participants = [backend.senderUserId, backend.recipientUserId].sort()
  return {
    id: backend.id,
    conversationId: participants.join(':'),
    from: backend.senderUserId,
    fromName: backend.senderName,
    to: backend.recipientUserId,
    content: backend.content,
    timestamp: backend.createdAt,
    read: !!backend.read,
    deliveryStatus: 'delivered',
  }
}

/**
 * Maps the backend {@link RaisedHandResponse} to the frontend {@link RaisedHand}.
 * The backend does not know the participant's display name or LiveKit queue
 * position, so those are derived here.
 */
function toRaisedHand(
  backend: RaisedHandResponse,
  queuePosition: number,
  role: 'student' | 'teacher' = 'student',
): RaisedHand {
  return {
    id: backend.id,
    liveClassId: backend.liveClassId,
    userId: backend.userId,
    userName: backend.userId,
    role,
    raisedAt: backend.raisedAt,
    queuePosition,
    accepted: backend.accepted,
  }
}

/**
 * Obtains (and lazily connects) a STOMP client authenticated with the current
 * JWT. The bearer token is sent in the CONNECT headers; the backend validates
 * it and derives the sender identity from the principal.
 */
export function getStompClient(): Promise<Client> {
  const token = getAccessToken()
  if (!token) {
    return Promise.reject(new Error('Not authenticated'))
  }

  if (stompClient?.connected) {
    return Promise.resolve(stompClient)
  }
  if (stompPromise) {
    return stompPromise
  }

  stompPromise = new Promise<Client>((resolve, reject) => {
    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
      onConnect: () => {
        stompClient = client
        stompPromise = null
        resolve(client)
      },
      onStompError: (frame) => {
        stompPromise = null
        reject(
          new Error(
            frame?.body ?? 'STOMP connection to the live class service failed.',
          ),
        )
      },
    })
    client.activate()
  })

  return stompPromise
}

/** Disconnects the STOMP client (for example on logout or page unmount). */
export function disconnectStomp(): void {
  if (stompClient) {
    stompClient.deactivate()
    stompClient = null
  }
  stompPromise = null
}

export interface SendChatInput {
  liveClassId: string
  recipientUserId?: string
  content: string
}

/**
 * HTTP: conversation history between the authenticated user and the other
 * party in the class. Students omit `with` (defaults to the class teacher);
 * teachers supply `with` = the student id.
 */
export async function listChatMessages(
  classId: string,
  withUserId?: string,
): Promise<ChatMessage[]> {
  const url = withUserId
    ? `/api/live-classes/${classId}/chat?with=${encodeURIComponent(withUserId)}`
    : `/api/live-classes/${classId}/chat`
  const response = await liveClassClient.get<ChatMessageBackend[]>(url)
  return response.data.map(toChatMessage)
}

export async function markChatMessageRead(
  classId: string,
  messageId: string,
): Promise<void> {
  await liveClassClient.post(
    `/api/live-classes/${classId}/chat/${messageId}/read`,
  )
}

/**
 * WebSocket: publishes to `/app/live-classes/{classId}/chat`. The backend
 * derives the sender from the JWT and delivers the message privately to the
 * recipient (and echoes it back to the sender).
 */
export function sendChatMessage(classId: string, input: SendChatInput): Promise<void> {
  return getStompClient().then((client) => {
    client.publish({
      destination: `/app/live-classes/${classId}/chat`,
      body: JSON.stringify({
        liveClassId: input.liveClassId,
        recipientUserId: input.recipientUserId,
        content: input.content,
      }),
    })
  })
}

let chatSubscription: ReturnType<Client['subscribe']> | null = null

/**
 * WebSocket: subscribes to `/user/queue/live-class-chat`. Delivers messages
 * sent to the current user and echoes of messages the current user sent.
 */
export function subscribeToChat(
  onMessage: (message: ChatMessage) => void,
): Promise<void> {
  return getStompClient().then((client) => {
    chatSubscription = client.subscribe('/user/queue/live-class-chat', (frame) => {
      const parsed = JSON.parse(frame.body) as ChatMessageBackend
      onMessage(toChatMessage(parsed))
    })
  })
}

export function unsubscribeChat(): void {
  if (chatSubscription) {
    try {
      chatSubscription.unsubscribe()
    } catch {
      // ignore
    }
    chatSubscription = null
  }
}

/* ---------- Questions ---------- */

export async function listQuestions(classId: string): Promise<OlympiadQuestion[]> {
  const response = await liveClassClient.get<OlympiadQuestion[]>(
    `/api/live-classes/${classId}/questions`,
  )
  return response.data
}

export async function getActiveQuestion(
  classId: string,
): Promise<ActiveQuestionView | null> {
  const response = await liveClassClient.get<ActiveQuestionView | null>(
    `/api/live-classes/${classId}/questions/active`,
  )
  return response.data ?? null
}

export async function startQuestion(
  classId: string,
  questionId: string,
  durationSeconds: number,
): Promise<QuestionSession> {
  const response = await liveClassClient.post<QuestionSession>(
    `/api/live-classes/${classId}/questions/start`,
    { questionId, durationSeconds },
  )
  return response.data
}

export async function endQuestion(
  classId: string,
  sessionId: string,
): Promise<QuestionSession> {
  const response = await liveClassClient.post<QuestionSession>(
    `/api/live-classes/${classId}/questions/${sessionId}/end`,
  )
  return response.data
}

export async function revealAnswer(
  classId: string,
  sessionId: string,
): Promise<QuestionSession> {
  const response = await liveClassClient.post<QuestionSession>(
    `/api/live-classes/${classId}/questions/${sessionId}/reveal`,
  )
  return response.data
}

export async function submitAnswer(
  classId: string,
  sessionId: string,
  optionIndex: number,
): Promise<AnswerResult> {
  const response = await liveClassClient.post<AnswerResult>(
    `/api/live-classes/${classId}/questions/${sessionId}/answers`,
    { optionIndex },
  )
  return response.data
}

/* ---------- Question authoring ----------

   NOTE: The endpoints below are part of the required teacher question
   workflow but are not yet present in the observed Live Class Service
   contract (only list/start/end/reveal/submit exist). They are typed here
   so the frontend contract is explicit. The backend must implement them
   before the create/edit/launch flows can succeed; the UI surfaces backend
   errors as toasts and never simulates a successful response.

   Required endpoints:
     POST    /api/live-classes/{classId}/questions          (create)
     PUT     /api/live-classes/{classId}/questions/{id}     (update draft)
     DELETE  /api/live-classes/{classId}/questions/{id}     (delete draft)
     POST    /api/live-classes/{classId}/questions/{id}/pause
     POST    /api/live-classes/{classId}/questions/{id}/resume
     GET     /api/live-classes/{classId}/questions/{id}/responses  (stats)
 */

export async function createQuestion(
  classId: string,
  request: CreateQuestionRequest,
): Promise<OlympiadQuestion> {
  const response = await liveClassClient.post<OlympiadQuestion>(
    `/api/live-classes/${classId}/questions`,
    request,
  )
  return response.data
}

export async function updateQuestion(
  classId: string,
  questionId: string,
  request: UpdateQuestionRequest,
): Promise<OlympiadQuestion> {
  const response = await liveClassClient.put<OlympiadQuestion>(
    `/api/live-classes/${classId}/questions/${questionId}`,
    request,
  )
  return response.data
}

export async function deleteQuestion(
  classId: string,
  questionId: string,
): Promise<void> {
  await liveClassClient.delete(
    `/api/live-classes/${classId}/questions/${questionId}`,
  )
}

export async function pauseQuestion(
  classId: string,
  sessionId: string,
): Promise<QuestionSession> {
  const response = await liveClassClient.post<QuestionSession>(
    `/api/live-classes/${classId}/questions/${sessionId}/pause`,
  )
  return response.data
}

export async function resumeQuestion(
  classId: string,
  sessionId: string,
): Promise<QuestionSession> {
  const response = await liveClassClient.post<QuestionSession>(
    `/api/live-classes/${classId}/questions/${sessionId}/resume`,
  )
  return response.data
}

export async function getQuestionStats(
  classId: string,
  sessionId: string,
): Promise<QuestionStats> {
  const response = await liveClassClient.get<QuestionStats>(
    `/api/live-classes/${classId}/questions/${sessionId}/responses`,
  )
  return response.data
}

/* ---------- Raise hand ----------

   NOTE: The raise-hand endpoints below are not yet present in the observed
   Live Class Service contract. They are typed explicitly; the backend must
   implement them before raise-hand acceptance/lowering can succeed.

   Required endpoints:
     POST    /api/live-classes/{classId}/raise-hand          (student raises)
     POST    /api/live-classes/{classId}/lower-hand          (student lowers)
     GET     /api/live-classes/{classId}/raise-hands         (teacher queue)
     POST    /api/live-classes/{classId}/raise-hands/{userId}/accept
     POST    /api/live-classes/{classId}/raise-hands/{userId}/lower
 */

export async function raiseHand(classId: string): Promise<RaisedHand> {
  const response = await liveClassClient.post<RaisedHandResponse>(
    `/api/live-classes/${classId}/raise-hand`,
  )
  return toRaisedHand(response.data, 1)
}

export async function lowerHand(classId: string): Promise<void> {
  await liveClassClient.post(`/api/live-classes/${classId}/lower-hand`)
}

export async function listRaisedHands(classId: string): Promise<RaisedHand[]> {
  const response = await liveClassClient.get<RaisedHandResponse[]>(
    `/api/live-classes/${classId}/raise-hands`,
  )
  return response.data.map((hand, index) => toRaisedHand(hand, index + 1))
}

export async function acceptRaisedHand(
  classId: string,
  userId: string,
): Promise<void> {
  await liveClassClient.post(
    `/api/live-classes/${classId}/raise-hands/${encodeURIComponent(userId)}/accept`,
  )
}

export async function lowerRaisedHand(
  classId: string,
  userId: string,
): Promise<void> {
  await liveClassClient.post(
    `/api/live-classes/${classId}/raise-hands/${encodeURIComponent(userId)}/lower`,
  )
}

/* ---------- Participant moderation ----------

   NOTE: Not present in the observed Live Class Service contract.

   Required endpoints:
     POST /api/live-classes/{classId}/participants/{userId}/mute
     POST /api/live-classes/{classId}/participants/mute-all
 */

export async function muteParticipant(classId: string, userId: string): Promise<void> {
  await liveClassClient.post(
    `/api/live-classes/${classId}/participants/${encodeURIComponent(userId)}/mute`,
  )
}

export async function muteAllParticipants(classId: string): Promise<void> {
  await liveClassClient.post(`/api/live-classes/${classId}/participants/mute-all`)
}
