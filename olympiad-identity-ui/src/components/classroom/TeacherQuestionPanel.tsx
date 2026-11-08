import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  createQuestion,
  getQuestionStats,
  updateQuestion,
} from '../../api/classroomApi'
import { type ActiveQuestionView } from '../../types/classroom'
import { useToast } from '../../hooks/useToast'
import { Button } from '../ui/button'
import { IconButton } from '../ui/button'
import { Card } from '../ui/card'
import { DialogContent, DialogProvider } from '../ui/dialog'
import { CountdownTimer } from './CountdownTimer'

function optionLetter(index: number): string {
  return String.fromCharCode(65 + index)
}

export interface TeacherQuestionPanelProps {
  classId: string
  activeQuestion: ActiveQuestionView | null
  canControl: boolean
  canReveal: boolean
  onStartQuestion: (questionId: string, durationSeconds: number) => void
  onEndQuestion: (sessionId: string) => void
  onRevealAnswer: (sessionId: string) => void
  onPauseQuestion: (sessionId: string) => void
  onResumeQuestion: (sessionId: string) => void
  onError: (message: string) => void
}

export function TeacherQuestionPanel({
  classId,
  activeQuestion,
  canControl,
  canReveal,
  onStartQuestion,
  onEndQuestion,
  onRevealAnswer,
  onPauseQuestion,
  onResumeQuestion,
  onError,
}: TeacherQuestionPanelProps) {
  const { toast } = useToast()
  const [draft, setDraft] = useState<{
    title: string
    description: string | null
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE'
    options: Array<{ text: string; isCorrect: boolean }>
    timerSeconds: number
  }>({
    title: '',
    description: null,
    type: 'MULTIPLE_CHOICE',
    options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
    timerSeconds: 300,
  })
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [editorError, setEditorError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const statsRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isActive = Boolean(
    activeQuestion && activeQuestion.status === 'ACTIVE' && !activeQuestion.answerRevealedAt,
  )
  const isRevealed = Boolean(
    activeQuestion && activeQuestion.status === 'ANSWER_REVEALED',
  )

  const optionsValid = useMemo(() => {
    const nonEmpty = draft.options.filter((o) => o.text.trim().length > 0)
    if (nonEmpty.length === 0) return false
    if (draft.type === 'TRUE_FALSE') return nonEmpty.length === 2
    return nonEmpty.some((o) => o.isCorrect)
  }, [draft])

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft((d) => ({ ...d, title: e.target.value }))
  }, [])
  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDraft((d) => ({ ...d, description: e.target.value }))
    },
    [],
  )
  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setDraft((d) => ({
        ...d,
        type: e.target.value as 'MULTIPLE_CHOICE' | 'TRUE_FALSE',
      }))
    },
    [],
  )
  const handleTimerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft((d) => ({ ...d, timerSeconds: Number(e.target.value) || 60 }))
  }, [])

  const handleOptionTextChange = useCallback(
    (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      setDraft((d) => ({
        ...d,
        options: d.options.map((o, i) =>
          i === index ? { ...o, text: e.target.value } : o,
        ),
      }))
    },
    [],
  )
  const handleCorrectChange = useCallback((index: number) => {
    setDraft((d) => ({
      ...d,
      options: d.options.map((o, i) => ({
        ...o,
        isCorrect: d.type === 'MULTIPLE_CHOICE' ? i === index : o.isCorrect,
      })),
    }))
  }, [draft.type])
  const handleAddOption = useCallback(() => {
    setDraft((d) => ({
      ...d,
      options: [...d.options, { text: '', isCorrect: false }],
    }))
  }, [])
  const handleRemoveOption = useCallback((index: number) => {
    setDraft((d) => ({
      ...d,
      options: d.options.filter((_, i) => i !== index),
    }))
  }, [])
  const handleNewQuestion = useCallback(() => {
    setEditingQuestionId(null)
    setDraft({
      title: '',
      description: null,
      type: 'MULTIPLE_CHOICE',
      options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
      timerSeconds: 300,
    })
    setEditorError(null)
  }, [])

  const handleSaveDraft = useCallback(async () => {
    setEditorError(null)
    const nonEmpty = draft.options.filter((o) => o.text.trim().length > 0)
    if (nonEmpty.length === 0) {
      setEditorError('Add at least one answer option.')
      return
    }
    if (draft.type === 'MULTIPLE_CHOICE' && !nonEmpty.some((o) => o.isCorrect)) {
      setEditorError('Mark one option as correct.')
      return
    }
    setSaving(true)
    try {
      if (editingQuestionId) {
        await updateQuestion(classId, editingQuestionId, {
          title: draft.title,
          description: draft.description,
          type: draft.type,
          options: nonEmpty.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
          timerSeconds: draft.timerSeconds,
        })
        toast({ title: 'Question saved', variant: 'success' })
      } else {
        const created = await createQuestion(classId, {
          title: draft.title,
          description: draft.description,
          type: draft.type,
          options: nonEmpty.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
          timerSeconds: draft.timerSeconds,
        })
        setEditingQuestionId(created.id)
        toast({ title: 'Question created', variant: 'success' })
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save the question.'
      setEditorError(message)
      onError(message)
    } finally {
      setSaving(false)
    }
  }, [classId, editingQuestionId, draft, onError, toast])

  const handleLaunch = useCallback(async () => {
    if (!canControl) return
    setEditorError(null)
    const targetId = editingQuestionId
    if (!targetId) {
      setEditorError('Save the draft before launching.')
      return
    }
    try {
      await onStartQuestion(targetId, draft.timerSeconds)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to launch the question.'
      setEditorError(message)
      onError(message)
    }
  }, [canControl, editingQuestionId, draft.timerSeconds, onStartQuestion, onError])

  const handleEnd = useCallback(() => {
    if (!activeQuestion?.id || !canControl) return
    setConfirmEnd(true)
  }, [activeQuestion, canControl])

  const handleConfirmEnd = useCallback(async () => {
    try {
      await onEndQuestion(activeQuestion!.id)
      setConfirmEnd(false)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to end the question.'
      onError(message)
    }
  }, [activeQuestion, onEndQuestion, onError])

  const handlePause = useCallback(async () => {
    if (!activeQuestion?.id || !canControl) return
    try {
      await onPauseQuestion(activeQuestion.id)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to pause the timer.')
    }
  }, [activeQuestion, canControl, onPauseQuestion, onError])

  const handleResume = useCallback(async () => {
    if (!activeQuestion?.id || !canControl) return
    try {
      await onResumeQuestion(activeQuestion.id)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to resume the timer.')
    }
  }, [activeQuestion, canControl, onResumeQuestion, onError])

  const handleReveal = useCallback(async () => {
    if (!activeQuestion?.id || !canReveal) return
    try {
      await onRevealAnswer(activeQuestion.id)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to reveal the answer.')
    }
  }, [activeQuestion, canReveal, onRevealAnswer, onError])

  useEffect(() => {
    if (!activeQuestion || activeQuestion.status !== 'ACTIVE') {
      setStats(null)
      return
    }
    const load = async () => {
      try {
        const data = await getQuestionStats(classId, activeQuestion.id)
        setStats(data)
      } catch (err) {
        setStatsError(
          err instanceof Error ? err.message : 'Failed to load response statistics.',
        )
      }
    }
    void load()
    statsRef.current = setInterval(load, 3000)
    return () => {
      if (statsRef.current) clearInterval(statsRef.current)
    }
  }, [activeQuestion, classId])

  const answeredCount = stats?.answeredCount ?? 0
  const totalStudents = stats?.totalStudents ?? 0
  const correctCount = stats?.correctCount ?? 0

  return (
    <section className="panel">
      <DialogProvider open={confirmEnd} onClose={() => setConfirmEnd(false)}>
        <DialogContent
          open={confirmEnd}
          onClose={() => setConfirmEnd(false)}
          title="End question?"
        >
          <p className="dialog__body">
            Ending the question will stop submissions for all students. Students
            who have not answered will not be able to submit.
          </p>
            <div
              className="dialog__body"
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
                justifyContent: 'flex-end',
                marginTop: 'var(--space-4)',
              }}
            >
            <Button variant="ghost" size="sm" onClick={() => setConfirmEnd(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmEnd}>
              End question
            </Button>
          </div>
        </DialogContent>
      </DialogProvider>

      <div className="question-editor">
        <div className="panel__title">
          {editingQuestionId ? 'Edit question' : 'New question'}
          <Button variant="ghost" size="sm" onClick={handleNewQuestion} disabled={!canControl}>
            New draft
          </Button>
        </div>

        <Card padded className="question-editor-card">
          <div className="question-editor__row">
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-field__label" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
                Question title
              </label>
              <input
                className="form-input"
                value={draft.title}
                onChange={handleTitleChange}
                placeholder="e.g. Pythagorean theorem"
                disabled={!canControl}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-field__label" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
                Description
              </label>
              <textarea
                className="form-input"
                value={draft.description ?? ''}
                onChange={handleDescriptionChange}
                rows={2}
                placeholder="Additional context for students"
                disabled={!canControl}
              />
            </div>
          </div>
          <div className="question-editor__row">
            <div>
              <label className="form-field__label" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
                Type
              </label>
              <select
                className="form-input"
                value={draft.type}
                onChange={handleTypeChange}
                disabled={!canControl}
              >
                <option value="MULTIPLE_CHOICE">Multiple choice</option>
                <option value="TRUE_FALSE">True / False</option>
              </select>
            </div>
            <div>
              <label className="form-field__label" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
                Timer (seconds)
              </label>
              <input
                className="form-input"
                type="number"
                min="10"
                value={draft.timerSeconds}
                onChange={handleTimerChange}
                disabled={!canControl}
              />
            </div>
          </div>
          <div>
            <label className="form-field__label" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
              Answer options
            </label>
            <div className="option-list">
              {draft.options.map((option, index) => (
                <div
                  key={index}
                  className={[
                    'option-item',
                    option.isCorrect ? 'option-item--correct' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <input
                    type="radio"
                    name="correct-option"
                    checked={option.isCorrect}
                    onChange={() => handleCorrectChange(index)}
                    disabled={!canControl || draft.type === 'TRUE_FALSE'}
                    aria-label={`Mark option ${optionLetter(index)} as correct`}
                  />
                  <input
                    className="form-input"
                    value={option.text}
                    onChange={(e) => handleOptionTextChange(index, e)}
                    placeholder={`Option ${optionLetter(index)}`}
                    disabled={!canControl}
                  />
                  {draft.type === 'TRUE_FALSE' ? (
                    <span className="badge badge--neutral badge--sm" style={{ marginLeft: 'auto' }}>
                      {index === 0 ? 'True' : 'False'}
                    </span>
                  ) : (
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOption(index)}
                      disabled={!canControl || draft.options.length <= 2}
                      ariaLabel={`Remove option ${optionLetter(index)}`}
                    >
                      <span aria-hidden="true">×</span>
                    </IconButton>
                  )}
                </div>
              ))}
              {draft.type === 'MULTIPLE_CHOICE' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={!canControl}
                  className="button--block"
                >
                  Add option
                </Button>
              )}
            </div>
            {draft.type === 'TRUE_FALSE' && (
              <p className="form-field__hint">
                True / False uses two fixed options; select which one is correct.
              </p>
            )}
          </div>
          {editorError && (
            <p className="form-field__error" role="alert">{editorError}</p>
          )}
          <div className="card__actions" style={{ marginTop: 0 }}>
            <Button
              variant="primary"
              disabled={!canControl || !optionsValid || saving}
              onClick={handleSaveDraft}
            >
              {saving ? 'Saving…' : 'Save draft'}
            </Button>
            {editingQuestionId && (
              <Button
                variant="secondary"
                disabled={!canControl || saving}
                onClick={handleLaunch}
              >
                Launch question
              </Button>
            )}
          </div>
        </Card>

        {activeQuestion ? (
          <TeacherDashboard
            activeQuestion={activeQuestion}
            isActive={isActive}
            isRevealed={isRevealed}
            answeredCount={answeredCount}
            totalStudents={totalStudents}
            correctCount={correctCount}
            statsError={statsError}
            canControl={canControl}
            canReveal={canReveal}
            onLaunch={handleLaunch}
            onStart={() => onStartQuestion(activeQuestion.id, draft.timerSeconds)}
            onEnd={handleEnd}
            onReveal={handleReveal}
            onPause={handlePause}
            onResume={handleResume}
            endsAt={activeQuestion.endsAt}
            durationSeconds={activeQuestion.durationSeconds}
            status={activeQuestion.status}
          />
        ) : (
          <div className="empty-state">
            <h3 className="empty-state__title">No active question</h3>
            <p className="empty-state__description">
              Save a draft above and launch it, or start a question from the
              question bank.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

interface TeacherDashboardProps {
  activeQuestion: ActiveQuestionView
  isActive: boolean
  isRevealed: boolean
  answeredCount: number
  totalStudents: number
  correctCount: number
  statsError: string | null
  canControl: boolean
  canReveal: boolean
  onLaunch: () => void
  onStart: () => void
  onEnd: () => void
  onReveal: () => void
  onPause: () => void
  onResume: () => void
  endsAt: string | null
  durationSeconds: number
  status: string
}

function TeacherDashboard({
  activeQuestion,
  isActive,
  isRevealed,
  answeredCount,
  totalStudents,
  correctCount,
  statsError,
  canControl,
  canReveal,
  onLaunch,
  onStart,
  onEnd,
  onReveal,
  onPause,
  onResume,
  endsAt,
  durationSeconds,
  status,
}: TeacherDashboardProps) {
  const paused = status === 'PAUSED'
  const revealed = status === 'ANSWER_REVEALED'
  const ended = status === 'ENDED'
  const draftState = status === 'DRAFT' || status === 'NOT_STARTED'

  const timerStatus = useMemo(() => {
    if (ended || revealed) return 'expired'
    if (paused) return 'paused'
    if (isActive) return 'running'
    return 'idle'
  }, [ended, revealed, paused, isActive])

  const correctOption = activeQuestion.correctOption ?? null

  return (
    <section className="teacher-dashboard">
      <div className="panel__title">Active question</div>
      <span
        className={[
          'question-status',
          `question-status--${status.toLowerCase()}`,
        ].filter(Boolean).join(' ')}
      >
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </span>

      <CountdownTimer
        status={timerStatus}
        endsAt={endsAt}
        durationSeconds={durationSeconds}
        aria-label={`Question timer, ${status}`}
      />

      <Card padded className="question-card question-card--active">
        <div className="question-card__header">
          <span className="question-card__subject">
            {activeQuestion.subject} · {activeQuestion.topic}
          </span>
          <span className="question-card__number">Q{activeQuestion.number}</span>
        </div>
        <p className="question-card__statement">{activeQuestion.statement}</p>
        <ul className="question-options">
          {activeQuestion.options.map((text, index) => {
            const isCorrect = correctOption === index
            const revealedCorrect = isRevealed && isCorrect
            return (
              <li
                key={index}
                className={[
                  'question-option',
                  revealedCorrect ? 'question-option--correct' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="option-letter">{optionLetter(index)}</span>
                {text}
                {revealedCorrect && (
                  <span className="answer-badge answer-badge--correct">Correct</span>
                )}
              </li>
            )
          })}
        </ul>
        {isRevealed && activeQuestion.explanation && (
          <div className="explanation">
            <strong>Explanation:</strong> {activeQuestion.explanation}
          </div>
        )}
      </Card>

      <div className="dashboard-stat-row">
        <div className="stat-card">
          <div className="stat-card__label">Students</div>
          <div className="stat-card__value">{totalStudents}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Answered</div>
          <div className="stat-card__value">{answeredCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Correct</div>
          <div className="stat-card__value">{correctCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Pending</div>
          <div className="stat-card__value">
            {Math.max(0, totalStudents - answeredCount)}
          </div>
        </div>
      </div>

      {statsError && (
        <p className="form-field__error" role="alert">{statsError}</p>
      )}

      <div className="question-actions">
        {draftState && canControl && (
          <Button variant="primary" onClick={onStart} disabled={!canControl}>
            Start question
          </Button>
        )}
        {isActive && canControl && !paused && (
          <Button variant="secondary" onClick={onPause} disabled={!canControl}>
            Pause timer
          </Button>
        )}
        {isActive && canControl && paused && (
          <Button variant="secondary" onClick={onResume} disabled={!canControl}>
            Resume timer
          </Button>
        )}
        {isActive && canControl && (
          <Button variant="secondary" onClick={onReveal} disabled={!canReveal}>
            Reveal answer
          </Button>
        )}
        {isActive && canControl && (
          <Button variant="danger" onClick={onEnd} disabled={!canControl}>
            End question
          </Button>
        )}
        {revealed && canControl && (
          <Button variant="danger" onClick={onEnd} disabled={!canControl}>
            End question
          </Button>
        )}
        {ended && canControl && (
          <Button variant="secondary" onClick={onLaunch} disabled={!canControl}>
            Relaunch question
          </Button>
        )}
      </div>
    </section>
  )
}
