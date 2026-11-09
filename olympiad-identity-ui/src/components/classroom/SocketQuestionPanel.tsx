import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'

interface QOpt { optionId: string; optionText: string }
interface QState {
  questionId: string
  classroomId?: string
  questionText: string
  options: QOpt[]
  status: string
  durationSeconds: number
  startedAt?: string
  endsAt?: string
  correctOptionId?: string
  explanation?: string
  myAnswer?: { optionId: string; submittedAt: string } | null
}

interface Props {
  socket: Socket | null
  classId: string
  isTeacher: boolean
}

function fmtRemaining(endsAt?: string): number {
  if (!endsAt) return 0
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000))
}

export function SocketQuestionPanel({ socket, classId, isTeacher }: Props) {
  const [q, setQ] = useState<QState | null>(null)
  const [text, setText] = useState('')
  const [opts, setOpts] = useState<string[]>(['', ''])
  const [correct, setCorrect] = useState('opt-1')
  const [duration, setDuration] = useState(30)
  const [explanation, setExplanation] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const lastQuestionIdRef = useRef<string | null>(null)

  const mergeQuestion = useCallback((incoming: Partial<QState> | null) => {
    if (!incoming) { setQ(null); return }
    setQ((prev) => {
      const next = { ...(prev && prev.questionId === incoming.questionId ? prev : {}), ...incoming } as QState
      if (incoming.questionId && incoming.questionId !== lastQuestionIdRef.current) {
        lastQuestionIdRef.current = incoming.questionId
        setSelected(incoming.myAnswer?.optionId ?? null)
        setSubmitted(Boolean(incoming.myAnswer))
      } else if (incoming.myAnswer) {
        setSelected(incoming.myAnswer.optionId)
        setSubmitted(true)
      }
      return next
    })
    if (incoming.endsAt) setRemaining(fmtRemaining(incoming.endsAt))
  }, [])

  useEffect(() => {
    if (!socket) return
    let disposed = false
    const onState = (s: QState) => { if (!disposed && (!s.classroomId || s.classroomId === classId)) mergeQuestion(s) }
    const onRevealed = (r: { questionId?: string; correctOptionId?: string; explanation?: string }) => {
      if (disposed) return
      setQ((prev) => prev && (!r.questionId || prev.questionId === r.questionId)
        ? { ...prev, status: 'ANSWER_REVEALED', correctOptionId: r.correctOptionId, explanation: r.explanation }
        : prev)
    }
    const onTimer = (t: { questionId?: string; endsAt?: string; remainingSeconds?: number }) => {
      if (disposed) return
      setQ((prev) => prev && (!t.questionId || prev.questionId === t.questionId) ? { ...prev, endsAt: t.endsAt ?? prev.endsAt } : prev)
      if (typeof t.remainingSeconds === 'number') setRemaining(t.remainingSeconds)
      else if (t.endsAt) setRemaining(fmtRemaining(t.endsAt))
    }
    const onExpired = (t: { questionId?: string }) => {
      if (disposed) return
      setQ((prev) => prev && (!t?.questionId || prev.questionId === t.questionId) ? { ...prev, status: 'TIME_EXPIRED' } : prev)
      setRemaining(0)
    }
    const onError = (e: { message?: string }) => { if (!disposed) setError(e?.message || 'Question error') }
    const onStats = (s: { questionId?: string; answeredCount?: number }) => {
      if (disposed) return
      setQ((prev) => prev && (!s.questionId || prev.questionId === s.questionId) ? ({ ...prev, answeredCount: s.answeredCount } as QState & { answeredCount?: number }) : prev)
    }

    socket.on('question:state', onState)
    socket.on('question:answer_revealed', onRevealed)
    socket.on('question:timer', onTimer)
    socket.on('question:time_expired', onExpired)
    socket.on('question:error', onError)
    socket.on('question:stats', onStats)

    const doSync = () => {
      socket.timeout(5000).emit('question:sync', { classId }, (_err: unknown, ack?: { ok?: boolean; question?: QState | null }) => {
        if (disposed) return
        if (ack?.ok) mergeQuestion(ack.question ?? null)
      })
    }
    if (socket.connected) doSync()
    socket.on('connect', doSync)

    return () => {
      disposed = true
      socket.off('question:state', onState)
      socket.off('question:answer_revealed', onRevealed)
      socket.off('question:timer', onTimer)
      socket.off('question:time_expired', onExpired)
      socket.off('question:error', onError)
      socket.off('question:stats', onStats)
      socket.off('connect', doSync)
    }
  }, [socket, classId, mergeQuestion])

  useEffect(() => {
    if (!q?.endsAt || q.status !== 'ACTIVE') return
    const t = setInterval(() => setRemaining(fmtRemaining(q.endsAt)), 1000)
    return () => clearInterval(t)
  }, [q?.endsAt, q?.status])

  const active = q?.status === 'ACTIVE'
  const revealed = q?.status === 'ANSWER_REVEALED'
  const closed = q?.status === 'CLOSED' || q?.status === 'TIME_EXPIRED'
  const canSubmit = !isTeacher && active && !submitted && !!selected && remaining > 0

  const emitTeacher = useCallback((event: string, payload: Record<string, unknown>, okMsg?: string) => {
    if (!socket || !isTeacher || pending) return
    setPending(true); setError(null); setInfo(null)
    socket.emit(event, payload)
    window.setTimeout(() => setPending(false), 600)
    if (okMsg) setInfo(okMsg)
  }, [socket, isTeacher, pending])

  const create = useCallback(() => {
    if (!socket || !isTeacher || pending) return
    const clean = opts.map((o) => o.trim()).filter(Boolean)
    if (!text.trim() || clean.length < 2) { setError('Enter question text and at least 2 options.'); return }
    const correctId = clean[Number(correct.replace('opt-', '')) - 1] ? correct : 'opt-1'
    setPending(true); setError(null); setInfo(null)
    socket.emit('question:create', { classId, questionText: text.trim(), options: clean, correctOptionId: correctId, durationSeconds: Math.max(5, Math.min(3600, duration)), explanation: explanation.trim() || undefined })
    window.setTimeout(() => { setPending(false); setInfo('Question created.'); setShowCreate(false) }, 600)
  }, [socket, isTeacher, pending, opts, text, correct, classId, duration, explanation])

  const start = useCallback(() => q && emitTeacher('question:start', { classId, questionId: q.questionId }, 'Question started.'), [q, emitTeacher, classId])
  const closeQ = useCallback(() => q && emitTeacher('question:close', { classId, questionId: q.questionId }, 'Question closed.'), [q, emitTeacher, classId])
  const reveal = useCallback(() => q && emitTeacher('question:reveal_answer', { classId, questionId: q.questionId }, 'Answer revealed.'), [q, emitTeacher, classId])

  const submit = useCallback(() => {
    if (!socket || !q || !selected || !canSubmit || pending) return
    setPending(true); setError(null)
    socket.timeout(8000).emit('question:answer', { classId, questionId: q.questionId, optionId: selected }, (err: unknown, ack?: { ok?: boolean; error?: string; alreadySubmitted?: boolean }) => {
      setPending(false)
      if (err) { setError('Timed out submitting answer.'); return }
      if (!ack?.ok) { setError(ack?.error || 'Could not submit answer.'); if (ack?.alreadySubmitted) setSubmitted(true); return }
      setSubmitted(true); setInfo('Answer submitted.')
      setQ((prev) => prev ? { ...prev, myAnswer: { optionId: selected, submittedAt: new Date().toISOString() } } : prev)
    })
  }, [socket, q, selected, canSubmit, pending, classId])

  const resetForm = useCallback(() => { setText(''); setOpts(['', '']); setCorrect('opt-1'); setDuration(30); setExplanation(''); setError(null); setInfo(null) }, [])

  const progress = useMemo(() => {
    if (!q?.durationSeconds || !active) return 0
    return Math.max(0, Math.min(100, (remaining / q.durationSeconds) * 100))
  }, [q?.durationSeconds, active, remaining])

  return (
    <section className="sq-panel" aria-label="Questions">
      <div className="sq-header">
        <h3 className="sq-title">Questions</h3>
        {q && <span className={`sq-badge sq-badge--${q.status.toLowerCase()}`}>{q.status.replace(/_/g, ' ')}</span>}
      </div>

      {error && <p className="sq-msg sq-msg--error" role="alert">{error}</p>}
      {info && <p className="sq-msg sq-msg--info" role="status">{info}</p>}

      {isTeacher && (
        <div className="sq-teacher">
          {!showCreate ? (
            <div className="sq-actions">
              <button className="button button--primary button--sm" onClick={() => { setShowCreate(true); setError(null) }}>Create question</button>
            </div>
          ) : (
            <div className="sq-form">
              <div className="sq-form__head">
                <span className="sq-form__title">New question</span>
                <button type="button" className="button button--ghost button--sm" onClick={() => setShowCreate(false)}>Close</button>
              </div>
              <label className="sq-label" htmlFor="sq-text">Question</label>
              <textarea id="sq-text" className="form-input sq-textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter the question…" rows={3} />
              <label className="sq-label">Options</label>
              <div className="sq-options-edit">
                {opts.map((o, i) => (
                  <div key={i} className="sq-option-row">
                    <input type="radio" name="sq-correct" checked={correct === `opt-${i + 1}`} onChange={() => setCorrect(`opt-${i + 1}`)} aria-label={`Mark option ${i + 1} correct`} />
                    <input className="form-input" value={o} onChange={(e) => { const n = [...opts]; n[i] = e.target.value; setOpts(n) }} placeholder={`Option ${i + 1}`} />
                    <button type="button" className="button button--ghost button--sm" disabled={opts.length <= 2} onClick={() => setOpts(opts.filter((_, j) => j !== i))} aria-label="Remove option">×</button>
                  </div>
                ))}
              </div>
              <div className="sq-form__row">
                <button type="button" className="button button--ghost button--sm" onClick={() => setOpts([...opts, ''])}>Add option</button>
                <label className="sq-inline"><span>Seconds</span><input className="form-input sq-num" type="number" min={5} max={3600} value={duration} onChange={(e) => setDuration(Number(e.target.value) || 30)} /></label>
              </div>
              <label className="sq-label" htmlFor="sq-exp">Explanation (optional, shown on reveal)</label>
              <input id="sq-exp" className="form-input" value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Why the answer is correct…" />
              <div className="sq-actions">
                <button type="button" className="button button--ghost button--sm" onClick={resetForm}>Reset</button>
                <button type="button" className="button button--primary button--sm" disabled={pending || !socket?.connected} onClick={create}>{pending ? 'Saving…' : 'Save draft'}</button>
              </div>
            </div>
          )}

          {q && (
            <div className="sq-actions sq-actions--controls">
              <button type="button" className="button button--primary button--sm" disabled={pending || !socket?.connected || active} onClick={start}>{active ? 'Running' : 'Start question'}</button>
              <button type="button" className="button button--secondary button--sm" disabled={pending || !socket?.connected || !q || (!active && q.status !== 'TIME_EXPIRED')} onClick={closeQ}>Close question</button>
              <button type="button" className="button button--secondary button--sm" disabled={pending || !socket?.connected || !q || revealed} onClick={reveal}>Reveal answer</button>
            </div>
          )}
        </div>
      )}

      {!q ? (
        <div className="sq-empty">
          <p className="sq-empty__title">No question</p>
          <p className="sq-empty__desc">{isTeacher ? 'Create a question to get started.' : 'Wait for your teacher to start a question.'}</p>
        </div>
      ) : (
        <div className="sq-card">
          {active && (
            <div className="sq-timer" aria-label={`Time remaining ${remaining} seconds`}>
              <div className="sq-timer__row"><span>Time remaining</span><strong>{remaining}s</strong></div>
              <div className="sq-timer__bar"><div className="sq-timer__fill" style={{ width: `${progress}%` }} /></div>
            </div>
          )}
          <p className="sq-question">{q.questionText}</p>
          <ul className="sq-options">
            {q.options.map((o) => {
              const isMine = selected === o.optionId || q.myAnswer?.optionId === o.optionId
              const isCorrect = revealed && q.correctOptionId === o.optionId
              const isWrongMine = revealed && isMine && q.correctOptionId !== o.optionId
              const selectable = !isTeacher && active && !submitted
              return (
                <li key={o.optionId}>
                  <button
                    type="button"
                    className={[
                      'sq-option',
                      isMine ? 'sq-option--selected' : '',
                      isCorrect ? 'sq-option--correct' : '',
                      isWrongMine ? 'sq-option--wrong' : '',
                    ].filter(Boolean).join(' ')}
                    disabled={!selectable}
                    onClick={() => selectable && setSelected(o.optionId)}
                  >
                    <span className="sq-option__text">{o.optionText}</span>
                    {isCorrect && <span className="sq-tag sq-tag--ok">Correct</span>}
                    {isWrongMine && <span className="sq-tag sq-tag--bad">Your answer</span>}
                    {submitted && isMine && !revealed && <span className="sq-tag">Submitted</span>}
                  </button>
                </li>
              )
            })}
          </ul>

          {!isTeacher && active && (
            <div className="sq-actions">
              <button type="button" className="button button--primary button--sm" disabled={!canSubmit || pending} onClick={submit}>
                {pending ? 'Submitting…' : submitted ? 'Submitted' : 'Submit answer'}
              </button>
              {submitted && !revealed && <span className="sq-hint">Answer submitted. Waiting for results.</span>}
            </div>
          )}

          {!isTeacher && closed && !revealed && (
            <p className="sq-hint">Question closed. {submitted ? 'Your answer was recorded.' : 'You did not submit an answer.'} Waiting for the teacher to reveal.</p>
          )}

          {revealed && (
            <div className="sq-reveal">
              <p><strong>Correct answer:</strong> {q.options.find((o) => o.optionId === q.correctOptionId)?.optionText || q.correctOptionId}</p>
              {q.explanation && <p className="sq-explanation">{q.explanation}</p>}
              {!isTeacher && submitted && q.myAnswer && (
                <p className={q.myAnswer.optionId === q.correctOptionId ? 'sq-msg sq-msg--info' : 'sq-msg sq-msg--error'}>
                  {q.myAnswer.optionId === q.correctOptionId ? 'Your answer was correct.' : 'Your answer was incorrect.'}
                </p>
              )}
            </div>
          )}

          {isTeacher && typeof (q as QState & { answeredCount?: number }).answeredCount === 'number' && (
            <p className="sq-hint">Responses received: {(q as QState & { answeredCount?: number }).answeredCount}</p>
          )}
        </div>
      )}
    </section>
  )
}
