import { useCallback, useMemo, useState } from 'react'
import { type ActiveQuestionView } from '../../types/classroom'
import { useToast } from '../../hooks/useToast'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { CountdownTimer } from './CountdownTimer'

export interface StudentQuestionPanelProps {
  activeQuestion: ActiveQuestionView | null
  myAnswer: { optionIndex: number; isCorrect: boolean | null } | null
  alreadyAnswered: boolean
  onSubmitAnswer: (optionIndex: number) => Promise<void>
  onError: (message: string) => void
}

function optionLetter(index: number): string {
  return String.fromCharCode(65 + index)
}

export function StudentQuestionPanel({
  activeQuestion,
  myAnswer,
  alreadyAnswered,
  onSubmitAnswer,
  onError,
}: StudentQuestionPanelProps) {
  const { toast } = useToast()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmitPromise = useCallback(
    (optionIndex: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        void onSubmitAnswer(optionIndex)
          .then(() => resolve())
          .catch(reject)
      })
    },
    [onSubmitAnswer],
  )

  const isActive = Boolean(
    activeQuestion && activeQuestion.status === 'ACTIVE' && !activeQuestion.answerRevealedAt,
  )
  const isRevealed = Boolean(activeQuestion && activeQuestion.status === 'ANSWER_REVEALED')
  const correctOption = activeQuestion?.correctOption ?? null

  const canSelect = isActive && !alreadyAnswered && !submitting

  const handleSelect = useCallback((index: number) => {
    if (!canSelect) return
    setSelectedOption(index)
    setSubmitError(null)
  }, [canSelect])

  const handleSubmit = useCallback(async () => {
    if (!canSelect || selectedOption === null || !activeQuestion?.id) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await handleSubmitPromise(selectedOption)
      setSubmitting(false)
      toast({ title: 'Answer submitted', variant: 'success' })
    } catch (err) {
      setSubmitting(false)
      const message =
        err instanceof Error ? err.message : 'Failed to submit your answer.'
      setSubmitError(message)
      onError(message)
    }
  }, [canSelect, selectedOption, activeQuestion, handleSubmitPromise, toast, onError])

  const statusChip = useMemo(() => {
    if (isRevealed) return 'answer-revealed'
    if (alreadyAnswered) return 'submitted'
    if (isActive) return 'active'
    return 'inactive'
  }, [isRevealed, alreadyAnswered, isActive])

  return (
    <section className="panel">
      <div className="panel__title">Question</div>

      {!activeQuestion ? (
        <div className="empty-state">
          <h3 className="empty-state__title">No active question</h3>
          <p className="empty-state__description">
            Wait for your teacher to launch a question.
          </p>
        </div>
      ) : (
        <>
      <CountdownTimer
        status={isRevealed || !isActive ? 'expired' : 'running'}
        endsAt={activeQuestion.endsAt}
        durationSeconds={activeQuestion.durationSeconds}
        aria-label="Question timer"
      />

          <span
            className={[
              'question-status',
              `question-status--${statusChip}`,
            ].filter(Boolean).join(' ')}
          >
            {statusChip.charAt(0).toUpperCase() + statusChip.slice(1)}
          </span>

          <Card padded className="question-card">
            <div className="question-card__header">
              <span className="question-card__subject">
                {activeQuestion.subject} · {activeQuestion.topic}
              </span>
              <span className="question-card__number">Q{activeQuestion.number}</span>
            </div>
            <p className="question-card__statement">{activeQuestion.statement}</p>

            <ul className="question-options">
              {activeQuestion.options.map((text: string, index: number) => {
                const isSelected = selectedOption === index
                const isCorrect = correctOption === index
                const isMine = myAnswer?.optionIndex === index
                const revealedCorrect = isRevealed && isCorrect
                const revealedWrong =
                  isRevealed && isMine && !isCorrect && index === myAnswer.optionIndex
                const selected = alreadyAnswered ? isMine : isSelected
                const disabled = !canSelect || alreadyAnswered || isRevealed
                return (
                  <li
                    key={index}
                    className={[
                      'question-option',
                      selected ? 'question-option--selected' : '',
                      revealedCorrect ? 'question-option--correct' : '',
                      revealedWrong ? 'question-option--incorrect' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <input
                      type="radio"
                      name="answer-option"
                      checked={selected}
                      disabled={disabled}
                      onChange={() => handleSelect(index)}
                      aria-label={`Select option ${optionLetter(index)}`}
                    />
                    <span className="option-letter">{optionLetter(index)}</span>
                    {text}
                    {alreadyAnswered && isMine && !isRevealed && (
                      <span className="answer-badge answer-badge--correct">
                        Submitted
                      </span>
                    )}
                    {revealedCorrect && (
                      <span className="answer-badge answer-badge--correct">Correct answer</span>
                    )}
                    {revealedWrong && (
                      <span className="answer-badge answer-badge--incorrect">Your answer</span>
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
                {isRevealed && myAnswer != null && (
                  <p className="form-field__hint">
                    {myAnswer!.isCorrect ? 'Your answer was correct.' : 'Your answer was incorrect.'}
                  </p>
                )}
          </Card>

          {canSelect && !alreadyAnswered && !isRevealed && (
            <div className="question-actions">
              <Button
                variant="primary"
                disabled={selectedOption === null}
                onClick={handleSubmit}
              >
                {submitting ? 'Submitting…' : 'Submit answer'}
              </Button>
              {submitError && (
                <p className="form-field__error" role="alert">{submitError}</p>
              )}
            </div>
          )}
          {alreadyAnswered && !isRevealed && (
            <p className="empty-state__description">
              Answer submitted. Wait for your teacher to reveal the answer.
            </p>
          )}
          {alreadyAnswered && isRevealed && myAnswer != null && (
            <p className="empty-state__description">
              {myAnswer!.isCorrect ? 'Your answer was correct.' : 'Your answer was incorrect.'}
            </p>
          )}
        </>
      )}
    </section>
  )
}
