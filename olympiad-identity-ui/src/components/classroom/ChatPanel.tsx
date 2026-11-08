import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  getStompClient,
  listChatMessages,
  sendChatMessage,
  subscribeToChat,
  unsubscribeChat,
  markChatMessageRead,
} from '../../api/classroomApi'
import { type ChatMessage } from '../../types/classroom'
import { useToast } from '../../hooks/useToast'
import { IconButton } from '../ui/button'
import { Send } from 'lucide-react'
import { Badge } from '../ui/badge'

export interface ChatPanelProps {
  classId: string
  user: { id: string; name?: string } | null
  canChatSend: boolean
  isTeacher: boolean
  isStudent: boolean
  participants: Array<{ identity: string; name?: string }>
  onUnreadCountChange?: (count: number) => void
}

export function ChatPanel({
  classId,
  user,
  canChatSend,
  isTeacher,
  isStudent,
  participants,
  onUnreadCountChange,
}: ChatPanelProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const messagesRef = useRef<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [optimistic, setOptimistic] = useState<ChatMessage | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [stompReady, setStompReady] = useState(false)
  const myId = user?.id ?? null
  const myName = user
    ? `${user.name?.split(' ')[0] ?? ''} ${user.name?.split(' ').slice(-1)[0] ?? ''}`.trim() ||
      'You'
    : 'You'

  const recipientUserId = isStudent ? null : selectedStudentId

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const history = await listChatMessages(classId, recipientUserId ?? undefined)
        if (active) setMessages(history)
      } catch {
        // history load is best-effort; the live stream still works
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [classId, recipientUserId])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        await subscribeToChat((message) => {
          if (!active) return
          if (
            optimistic &&
            message.from === myId &&
            message.content === optimistic.content &&
            message.to === optimistic.to
          ) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === optimistic.id ? { ...message, deliveryStatus: 'delivered' } : m,
              ),
            )
            setOptimistic(null)
            setSending(false)
            return
          }
          if (!messagesRef.current.some((m) => m.id === message.id)) {
            setMessages((prev) => [...prev, message])
            if (message.from !== myId) {
              toast({ title: 'New message', variant: 'info' })
            }
          }
        })
        setStompReady(true)
      } catch {
        setStompReady(false)
      }
    })()
    return () => {
      active = false
      unsubscribeChat()
    }
  }, [classId, myId, optimistic, toast])

  const unreadCount = useMemo(() => {
    if (!recipientUserId) return 0
    return messages.filter(
      (m) => m.from !== myId && m.to === recipientUserId && !m.read,
    ).length
  }, [messages, myId, recipientUserId])

  useEffect(() => {
    void onUnreadCountChange?.(unreadCount)
  }, [unreadCount, onUnreadCountChange])

  const visibleMessages = useMemo(() => {
    return messages.filter(
      (m) => !recipientUserId || m.to === recipientUserId || m.from === recipientUserId,
    )
  }, [messages, recipientUserId])

  const handleSend = useCallback(async () => {
    if (!draft.trim() || !canChatSend) return
    void getStompClient()
    const content = draft.trim()
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: [myId ?? '', recipientUserId ?? ''].sort().join(':'),
      from: myId ?? '',
      fromName: myName,
      to: recipientUserId ?? '',
      content,
      timestamp: new Date().toISOString(),
      read: false,
      deliveryStatus: 'sending',
    }
    setMessages((prev) => [...prev, optimisticMessage])
    setOptimistic(optimisticMessage)
    setSending(true)
    setDraft('')
    try {
      await sendChatMessage(classId, {
        liveClassId: classId,
        recipientUserId: recipientUserId ?? undefined,
        content,
      })
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticMessage.id ? { ...m, deliveryStatus: 'error' } : m,
        ),
      )
      setOptimistic(null)
      setSending(false)
      toast({ title: 'Message failed to send', variant: 'error' })
    }
  }, [classId, draft, canChatSend, myId, myName, recipientUserId, toast])

  const handleMarkRead = useCallback(async (messageId: string) => {
    try {
      await markChatMessageRead(classId, messageId)
    } catch {
      // best-effort
    }
  }, [classId])

  const handleKeyDown = useCallback(
    (e: { key: string; shiftKey: boolean; preventDefault(): void; target: EventTarget }) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        void handleSend()
      }
    },
    [handleSend],
  )

  const readableTime = useCallback((value: string | null) => {
    if (!value) return '--'
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }, [])

  return (
    <section className="panel">
      <div className="panel__title">
        {isStudent ? 'Teacher chat' : 'Class chat'}
        {unreadCount > 0 && <Badge variant="danger" size="sm">{unreadCount}</Badge>}
      </div>

      <div className="panel__messages">
        {visibleMessages.length === 0 && (
          <p className="empty-state__description">
            {isStudent
              ? 'No messages with your teacher yet.'
              : 'Select a student to start a private conversation.'}
          </p>
        )}
        {visibleMessages.map((m) => (
          <ChatMessage
            key={m.id}
            message={m}
            isMe={m.from === myId}
            onMarkRead={handleMarkRead}
            optimisticId={optimistic?.id ?? null}
            isStudent={isStudent}
            readableTime={readableTime}
          />
        ))}
        {unreadCount > 0 && !recipientUserId && (
          <p className="empty-state__description">{unreadCount} unread message(s).</p>
        )}
      </div>

      <div className="panel__composer">
        {isTeacher && participants.length > 0 && (
          <div className="chat-recipient">
            <label>To:</label>
            <select
              value={selectedStudentId ?? ''}
              onChange={(e) => setSelectedStudentId(e.target.value || null)}
              className="form-input"
              disabled={!canChatSend || sending}
            >
              <option value="">Select a student</option>
              {participants.map((p) => (
                <option key={p.identity} value={p.identity}>
                  {p.name || p.identity}
                </option>
              ))}
            </select>
          </div>
        )}
        <textarea
          className="form-input chat-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          disabled={!canChatSend || sending || (isTeacher && !selectedStudentId)}
          onKeyDown={handleKeyDown}
        />
        <IconButton
          variant="primary"
          onClick={handleSend}
          disabled={
            !draft.trim() ||
            !canChatSend ||
            sending ||
            (isTeacher && !selectedStudentId) ||
            !stompReady
          }
          ariaLabel={sending ? 'Sending…' : 'Send message'}
        >
          <Send size={16} />
        </IconButton>
        {!stompReady && canChatSend && (
          <span className="chat-status-hint">Connecting to chat…</span>
        )}
      </div>
    </section>
  )
}

interface ChatMessageProps {
  message: ChatMessage
  isMe: boolean
  onMarkRead: (messageId: string) => void
  optimisticId: string | null
  isStudent: boolean
  readableTime: (value: string | null) => string
}

function ChatMessage({
  message,
  isMe,
  onMarkRead,
  optimisticId,
  isStudent,
  readableTime,
}: ChatMessageProps) {
  const alreadyRead = message.read
  return (
    <div
      className={`chat-message ${isMe ? 'chat-message--mine' : 'chat-message--theirs'}`}
      onClick={() => !isMe && !alreadyRead && onMarkRead(message.id)}
    >
      <div className="chat-message__meta">
        <span className="chat-message__sender">
          {isMe ? 'You' : message.fromName || 'Participant'}
        </span>
        {!isMe && (
          <span className="chat-message__role-badge">
            {isStudent ? 'Teacher' : 'Student'}
          </span>
        )}
        <span>{readableTime(message.timestamp)}</span>
        {optimisticId === message.id && (
          <span className="chat-message__status">sending…</span>
        )}
      </div>
      <div className="chat-message__body">{message.content}</div>
      {!isMe && !alreadyRead && (
        <span
          className="chat-message__unread"
          onClick={(e) => {
            e.stopPropagation()
            onMarkRead(message.id)
          }}
        >
          unread
        </span>
      )}
    </div>
  )
}
