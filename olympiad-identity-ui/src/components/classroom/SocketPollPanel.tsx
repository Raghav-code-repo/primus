import { useEffect, useState } from 'react'
import type { Socket } from 'socket.io-client'

interface PollOption { optionId: string; optionText: string }
interface PollState { pollId: string; question?: string; options?: PollOption[]; status: string; totalVotes?: number }

export function SocketPollPanel({ socket, classId, isTeacher }: { socket: Socket | null; classId: string; isTeacher: boolean }) {
  const [poll, setPoll] = useState<PollState | null>(null)
  const [question, setQuestion] = useState('')
  const [opts, setOpts] = useState(['', ''])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!socket) return
    let disposed = false
    const handler = (s: PollState) => { if (!disposed) setPoll(s) }
    const res = (r: PollState) => { if (!disposed) setPoll(r) }
    const onErr = (e: { message?: string }) => { if (!disposed) setError(e?.message || 'Poll error') }
    socket.on('poll:state', handler)
    socket.on('poll:results', res)
    socket.on('poll:error', onErr)
    return () => { disposed = true; socket.off('poll:state', handler); socket.off('poll:results', res); socket.off('poll:error', onErr) }
  }, [socket])

  const create = () => {
    if (!socket) return
    const clean = opts.map((o) => o.trim()).filter(Boolean)
    if (!question.trim() || clean.length < 2) { setError('Enter a question and at least 2 options.'); return }
    setError(null)
    socket.emit('poll:create', { classId, question: question.trim(), options: clean })
  }
  const start = () => poll && socket?.emit('poll:start', { classId, pollId: poll.pollId })
  const close = () => poll && socket?.emit('poll:close', { classId, pollId: poll.pollId })
  const vote = (optionId: string) => poll && socket?.emit('poll:vote', { classId, pollId: poll.pollId, optionId })

  return (
    <section className="sq-panel sq-panel--secondary" aria-label="Quick poll">
      <div className="sq-header">
        <h3 className="sq-title">Quick poll</h3>
        {poll && <span className={`sq-badge sq-badge--${String(poll.status).toLowerCase()}`}>{poll.status}</span>}
      </div>
      {error && <p className="sq-msg sq-msg--error" role="alert">{error}</p>}

      {isTeacher && (
        <div className="sq-form">
          <label className="sq-label" htmlFor="sp-q">Poll question</label>
          <input id="sp-q" className="form-input" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask the class…" />
          <label className="sq-label">Options</label>
          <div className="sq-options-edit">
            {opts.map((o, i) => (
              <div key={i} className="sq-option-row">
                <input className="form-input" value={o} onChange={(e) => { const n = [...opts]; n[i] = e.target.value; setOpts(n) }} placeholder={`Option ${i + 1}`} />
                <button type="button" className="button button--ghost button--sm" disabled={opts.length <= 2} onClick={() => setOpts(opts.filter((_, j) => j !== i))} aria-label="Remove option">×</button>
              </div>
            ))}
          </div>
          <div className="sq-actions">
            <button type="button" className="button button--ghost button--sm" onClick={() => setOpts([...opts, ''])}>Add option</button>
            <button type="button" className="button button--primary button--sm" disabled={!socket?.connected} onClick={create}>Create poll</button>
            {poll && <button type="button" className="button button--secondary button--sm" disabled={poll.status !== 'DRAFT'} onClick={start}>Start</button>}
            {poll && <button type="button" className="button button--secondary button--sm" disabled={poll.status === 'CLOSED'} onClick={close}>Close</button>}
          </div>
        </div>
      )}

      {poll ? (
        <div className="sq-card">
          <p className="sq-question">{poll.question}</p>
          <ul className="sq-options">
            {poll.options?.map((o) => (
              <li key={o.optionId}>
                <button type="button" className="sq-option" disabled={isTeacher || poll.status !== 'ACTIVE'} onClick={() => vote(o.optionId)}>
                  <span className="sq-option__text">{o.optionText}</span>
                </button>
              </li>
            ))}
          </ul>
          {typeof poll.totalVotes === 'number' && <p className="sq-hint">Total votes: {poll.totalVotes}</p>}
        </div>
      ) : (
        <p className="sq-empty__desc">{isTeacher ? 'Create a quick poll if needed.' : 'No active poll.'}</p>
      )}
    </section>
  )
}
