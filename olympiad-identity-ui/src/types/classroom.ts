
export type ParticipantRole = 'teacher' | 'student'

export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE'

export type QuestionSessionStatus =
  | 'DRAFT'
  | 'NOT_STARTED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'ENDED'
  | 'ANSWER_REVEALED'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'expired'

export interface ClassroomParticipantInfo {
  identity: string
  name: string
  role: ParticipantRole
  micEnabled: boolean
  cameraEnabled: boolean
  screenSharing: boolean
  handRaised: boolean
  connectionStatus:
    | 'connected'
    | 'connecting'
    | 'disconnected'
    | 'reconnecting'
}

export interface QuestionOption {
  id: string
  questionId: string
  text: string
  optionIndex: number
  isCorrect: boolean
}

export interface QuestionResponse {
  id: string
  questionSessionId: string
  studentUserId: string
  studentName: string
  optionIndex: number
  isCorrect: boolean | null
  submittedAt: string
  pointsAwarded: number
}

export interface QuestionStats {
  sessionId: string
  totalStudents: number
  answeredCount: number
  correctCount: number
  distribution: Record<number, number>
  responses: QuestionResponse[]
}

export interface TimerState {
  status: TimerStatus
  endsAt: string | null
  pausedAt: string | null
  durationSeconds: number | null
  remainingSeconds: number
}

export interface RaisedHand {
  id: string
  liveClassId: string
  userId: string
  userName: string
  role: ParticipantRole
  raisedAt: string
  queuePosition: number
  accepted: boolean
}

/** Backend wire shape for a raised hand (frontend maps it to {@link RaisedHand}). */
export interface RaisedHandResponse {
  id: string
  liveClassId: string
  userId: string
  raisedAt: string
  accepted: boolean
}

export interface CreateQuestionRequest {
  title: string
  description: string | null
  type: QuestionType
  options: Array<{ text: string; isCorrect?: boolean }>
  timerSeconds: number
}

export interface UpdateQuestionRequest {
  title?: string
  description?: string | null
  type?: QuestionType
  options?: Array<{ id?: string; text: string; isCorrect?: boolean }>
  timerSeconds?: number
}

export interface ClassroomParticipant {
  identity: string
  name: string
  role: ParticipantRole
  micEnabled: boolean
  cameraEnabled: boolean
  screenSharing: boolean
  handRaised: boolean
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'reconnecting'
}

export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'error'

export interface ChatMessage {
  id: string
  conversationId: string
  from: string
  fromName: string
  to: string
  content: string
  timestamp: string
  read: boolean
  deliveryStatus: DeliveryStatus
}

export interface QuestionSession {
  id: string
  liveClassId: string
  questionId: string
  startedBy: string
  startedAt: string | null
  durationSeconds: number
  endsAt: string | null
  status: QuestionSessionStatus
  answerRevealedAt: string | null
}

/**
 * The active question session combined with question content. The correct
 * answer and explanation are masked (null) for students until revealed.
 */
export interface ActiveQuestionView {
  id: string
  liveClassId: string
  questionId: string
  startedBy: string
  startedAt: string | null
  durationSeconds: number
  endsAt: string | null
  status: QuestionSessionStatus
  answerRevealedAt: string | null
  number: number | null
  subject: string
  topic: string
  statement: string
  options: string[]
  correctOption: number | null
  explanation: string | null
}

/**
 * Student-facing question view. The correct answer is intentionally omitted
 * until the teacher reveals it.
 */
export interface StudentQuestionView {
  id: string
  liveClassId: string
  number: number
  subject: string
  topic: string
  statement: string
  options: string[]
  explanation: string | null
  timerSeconds: number
  startedAt: string | null
  revealedAt: string | null
}

/**
 * Teacher-facing question view. Includes the correct answer and option index.
 */
export interface OlympiadQuestion {
  id: string
  liveClassId: string
  number: number
  subject: string
  topic: string
  statement: string
  options: string[]
  correctOption: number | null
  explanation: string | null
  timerSeconds: number
  startedAt: string | null
  revealedAt: string | null
}

export interface AnswerResult {
  id: string
  questionSessionId: string
  studentUserId: string
  optionIndex: number
  submittedAt: string
  isCorrect: boolean | null
  pointsAwarded: number
}

export interface ActivityEvent {
  id: string
  type:
    | 'joined'
    | 'left'
    | 'raised-hand'
    | 'question-started'
    | 'answer-revealed'
    | 'screen-share-started'
    | 'screen-share-stopped'
  actor: string
  actorName: string
  timestamp: string
  detail?: string
}

export interface UnreadSummary {
  conversationId: string
  withUserId: string
  withUserName: string
  unreadCount: number
  lastMessage: string | null
  lastMessageAt: string | null
}
