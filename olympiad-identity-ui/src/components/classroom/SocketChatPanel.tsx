import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { Send, RotateCcw } from 'lucide-react'

type DeliveryStatus = 'sending' | 'sent' | 'failed'

interface ChatMsg {
  messageId: string
  clientMessageId?: string
  classroomId?: string
  senderId?: string
  senderName: string
  message: string
  timestamp: string
  status?: DeliveryStatus
  error?: string
}

interface SendAck {
  ok?: boolean
  message?: ChatMsg
  error?: string
}

interface SocketChatPanelProps {
  socket: Socket | null
  connected: boolean
  classId: string
  userId: string | null
  displayName?: string | null
}

const ACK_TIMEOUT_MS = 8000

function makeClientMessageId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `cmsg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function timeLabel(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function nameFallback(senderId?: string, senderName?: string): string {
  const v = typeof senderName === 'string' ? senderName.trim() : ''
  if (v && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)) return v
  const at = v.indexOf('@')
  if (at > 0) return v.slice(0, at)
  if (v) return 'Participant'
  void senderId
  return 'Participant'
}

export function SocketChatPanel({ socket, connected, classId, userId, displayName }: SocketChatPanelProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [draft, setDraft] = useState('')
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const stickToBottomRef = useRef(true)
  const pendingRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const canSend = Boolean(socket && connected && draft.trim())

  const clearPending = useCallback((clientMessageId: string) => {
    const timer = pendingRef.current.get(clientMessageId)
    if (timer) {
      clearTimeout(timer)
      pendingRef.current.delete(clientMessageId)
    }
  }, [])

  const markFailed = useCallback(
    (clientMessageId: string, error: string) => {
      clearPending(clientMessageId)
      setMessages((prev) =>
        prev.map((m) =>
          m.clientMessageId === clientMessageId && m.status === 'sending'
            ? { ...m, status: 'failed', error }
            : m,
        ),
      )
    },
    [clearPending],
  )

  const mergeMessage = useCallback((incoming: ChatMsg, myId: string | null) => {
    setMessages((prev) => {
      if (incoming.clientMessageId) {
        const idx = prev.findIndex((m) => m.clientMessageId === incoming.clientMessageId)
        if (idx !== -1) {
          const next = [...prev]
          next[idx] = { ...next[idx], ...incoming, status: 'sent', error: undefined }
          return next
        }
      }
      if (prev.some((m) => m.messageId === incoming.messageId)) return prev
      const mine = Boolean(myId && incoming.senderId && incoming.senderId === myId)
      return [...prev, { ...incoming, status: mine ? 'sent' : incoming.status }]
    })
  }, [])

  useEffect(() => {
    if (!socket) {
      setConnectionError('Chat is not connected.')
      return
    }

    const onMessage = (m: ChatMsg) => {
      if (!m || m.classroomId !== classId) return
      if (m.clientMessageId) clearPending(m.clientMessageId)
      mergeMessage(m, userId)
    }

    const onHistory = (h: { classId?: string; messages?: ChatMsg[] }) => {
      if (!h || h.classId !== classId || !Array.isArray(h.messages)) return
      const normalized = h.messages
        .filter((m) => m && m.classroomId === classId)
        .map((m) => ({
          ...m,
          status: userId && m.senderId === userId ? ('sent' as const) : m.status,
        }))
      setMessages((prev) => {
        const byId = new Map(prev.map((m) => [m.messageId, m]))
        for (const m of normalized) {
          if (!byId.has(m.messageId)) byId.set(m.messageId, m)
        }
        return Array.from(byId.values()).sort((a, b) => {
          const ta = new Date(a.timestamp).getTime()
          const tb = new Date(b.timestamp).getTime()
          if (ta !== tb) return ta - tb
          return a.messageId.localeCompare(b.messageId)
        })
      })
    }

    const onChatError = (payload: { message?: string }) => {
      const msg = payload?.message || 'Chat error'
      setConnectionError(msg)
    }

    const onConnect = () => {
      setConnectionError(null)
      socket.emit('chat:history', { classId, limit: 50 })
    }

    const onDisconnect = () => {
      setConnectionError('Disconnected. Messages may fail until reconnected.')
      for (const [clientMessageId, timer] of pendingRef.current.entries()) {
        clearTimeout(timer)
        pendingRef.current.delete(clientMessageId)
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === clientMessageId && m.status === 'sending'
              ? { ...m, status: 'failed', error: 'Disconnected before confirmation' }
              : m,
          ),
        )
      }
    }

    socket.on('chat:message', onMessage)
    socket.on('chat:history', onHistory)
    socket.on('chat:error', onChatError)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    if (socket.connected) {
      socket.emit('chat:history', { classId, limit: 50 })
      setConnectionError(null)
    }

    return () => {
      socket.off('chat:message', onMessage)
      socket.off('chat:history', onHistory)
      socket.off('chat:error', onChatError)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      for (const timer of pendingRef.current.values()) clearTimeout(timer)
      pendingRef.current.clear()
    }
  }, [socket, classId, userId, clearPending, mergeMessage])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    if (stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages])

  const handleScroll = useCallback(() => {
    const el = listRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    stickToBottomRef.current = distance < 48
  }, [])

  const sendPayload = useCallback(
    (text: string, clientMessageId: string) => {
      if (!socket || !socket.connected) {
        markFailed(clientMessageId, 'Not connected')
        return
      }

      clearPending(clientMessageId)
      const timer = setTimeout(() => {
        markFailed(clientMessageId, 'No confirmation from server')
      }, ACK_TIMEOUT_MS)
      pendingRef.current.set(clientMessageId, timer)

      socket
        .timeout(ACK_TIMEOUT_MS)
        .emit(
          'chat:send',
          { classId, message: text, clientMessageId },
          (err: unknown, ack?: SendAck) => {
            if (pendingRef.current.get(clientMessageId) !== timer) return
            clearPending(clientMessageId)
            if (err) {
              markFailed(clientMessageId, 'Timed out waiting for confirmation')
              return
            }
            if (!ack?.ok) {
              markFailed(clientMessageId, ack?.error || 'Message could not be sent')
              return
            }
            if (ack.message) {
              mergeMessage(ack.message, userId)
            } else {
              setMessages((prev) =>
                prev.map((m) =>
                  m.clientMessageId === clientMessageId ? { ...m, status: 'sent', error: undefined } : m,
                ),
              )
            }
          },
        )
    },
    [socket, classId, userId, clearPending, markFailed, mergeMessage],
  )

  const sendMessage = useCallback(
    (text: string, existingClientMessageId?: string) => {
      const trimmed = text.trim()
      if (!trimmed || !socket || !classId) return

      const clientMessageId = existingClientMessageId ?? makeClientMessageId()
      const optimistic: ChatMsg = {
        messageId: existingClientMessageId ? `retry-${clientMessageId}` : clientMessageId,
        clientMessageId,
        classroomId: classId,
        senderId: userId ?? undefined,
        senderName: displayName || 'You',
        message: trimmed,
        timestamp: new Date().toISOString(),
        status: 'sending',
      }

      stickToBottomRef.current = true
      setMessages((prev) => {
        if (existingClientMessageId) {
          return prev.map((m) =>
            m.clientMessageId === existingClientMessageId
              ? { ...m, ...optimistic, error: undefined }
              : m,
          )
        }
        return [...prev, optimistic]
      })

      sendPayload(trimmed, clientMessageId)
    },
    [socket, classId, userId, displayName, sendPayload],
  )

  const handleSend = useCallback(() => {
    const text = draft.trim()
    if (!text) return
    if (!socket?.connected) {
      setConnectionError('Not connected. Reconnect to send messages.')
      return
    }
    setDraft('')
    setConnectionError(null)
    sendMessage(text)
  }, [draft, socket, sendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  const handleRetry = useCallback(
    (m: ChatMsg) => {
      if (!m.clientMessageId || m.status !== 'failed') return
      if (!socket?.connected) {
        setConnectionError('Not connected. Reconnect to retry.')
        return
      }
      setConnectionError(null)
      sendMessage(m.message, m.clientMessageId)
    },
    [socket, sendMessage],
  )

  const statusText = useMemo(() => {
    if (!socket) return 'Unavailable'
    return connected ? 'Connected' : 'Disconnected'
  }, [socket, connected])

  return (
    <section className="socket-chat" aria-label="Live chat">
      <div className="socket-chat__header">
        <div className="socket-chat__title-row">
          <h3 className="socket-chat__title">Live chat</h3>
          <span
            className={`socket-chat__status socket-chat__status--${connected ? 'connected' : 'disconnected'}`}
            title={statusText}
          >
            <span className="socket-chat__dot" aria-hidden="true" />
            {statusText}
          </span>
        </div>
        {connectionError && <p className="socket-chat__error" role="status">{connectionError}</p>}
      </div>

      <div className="socket-chat__messages" ref={listRef} onScroll={handleScroll}>
        {messages.length === 0 ? (
          <p className="socket-chat__empty">No messages yet. Start the conversation.</p>
        ) : (
          messages.map((m) => {
            const mine = Boolean(userId && m.senderId === userId) || m.senderName === (displayName || 'You')
            const key = m.messageId || m.clientMessageId || `${m.timestamp}-${m.message}`
            const shownSender = mine ? (displayName || 'You') : nameFallback(m.senderId, m.senderName)
            return (
              <div
                key={key}
                className={`socket-chat__bubble ${mine ? 'socket-chat__bubble--mine' : 'socket-chat__bubble--theirs'}`}
              >
                <div className="socket-chat__meta">
                  <span className="socket-chat__sender">{shownSender}</span>
                  <span className="socket-chat__time">{timeLabel(m.timestamp)}</span>
                </div>
                <div className="socket-chat__body">{m.message}</div>
                {mine && (
                  <div className="socket-chat__footer">
                    <span className={`socket-chat__delivery socket-chat__delivery--${m.status ?? 'sent'}`}>
                      {m.status === 'sending' ? 'Sending…' : m.status === 'failed' ? 'Failed' : 'Sent'}
                    </span>
                    {m.status === 'failed' && m.clientMessageId && (
                      <button
                        type="button"
                        className="socket-chat__retry"
                        onClick={() => handleRetry(m)}
                        aria-label="Retry sending message"
                      >
                        <RotateCcw size={12} aria-hidden="true" /> Retry
                      </button>
                    )}
                  </div>
                )}
                {mine && m.status === 'failed' && m.error && (
                  <p className="socket-chat__msg-error">{m.error}</p>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="socket-chat__composer">
        <textarea
          className="socket-chat__input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={2}
          aria-label="Chat message"
          disabled={!socket}
        />
        <button
          type="button"
          className="socket-chat__send"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          title="Send (Enter)"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </div>
      <p className="socket-chat__hint">Enter to send, Shift+Enter for a new line.</p>
    </section>
  )
}
