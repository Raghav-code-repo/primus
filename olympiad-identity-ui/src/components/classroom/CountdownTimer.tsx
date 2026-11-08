import { useCallback, useEffect, useMemo, useState } from 'react'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'expired'

export interface CountdownTimerProps {
  status: TimerStatus
  endsAt: string | null
  durationSeconds: number | null
  className?: string
  ariaLabel?: string
}

const WARNING_THRESHOLD_SECONDS = 30
const CRITICAL_THRESHOLD_SECONDS = 10

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(total / 60)
  const secs = (total % 60).toString().padStart(2, '0')
  const minStr = minutes.toString().padStart(2, '0')
  return minutes > 0 ? `${minStr}:${secs}` : `${secs}s`
}

function visualState(remaining: number, status: TimerStatus): 'normal' | 'warning' | 'critical' | 'expired' {
  if (status === 'expired' || remaining <= 0) return 'expired'
  if (remaining < CRITICAL_THRESHOLD_SECONDS) return 'critical'
  if (remaining <= WARNING_THRESHOLD_SECONDS) return 'warning'
  return 'normal'
}

export function CountdownTimer({
  status,
  endsAt,
  durationSeconds,
  className,
  ariaLabel,
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState<number>(0)
  const [visual, setVisual] = useState<'normal' | 'warning' | 'critical' | 'expired'>('normal')

  const endsAtMs = endsAt ? new Date(endsAt).getTime() : null
  const duration = durationSeconds ?? 0

  const computeRemaining = useCallback((): number => {
    if (status === 'idle' || duration <= 0) return 0
    if (status === 'running' && endsAtMs) {
      return Math.max(0, Math.ceil((endsAtMs - Date.now()) / 1000))
    }
    return 0
  }, [status, endsAtMs, duration])

  useEffect(() => {
    const next = computeRemaining()
    setRemaining(next)
    setVisual(visualState(next, status))
  }, [status, endsAt, durationSeconds, computeRemaining])

  const tick = useCallback(() => {
    const next = computeRemaining()
    setRemaining(next)
    setVisual(visualState(next, status))
  }, [computeRemaining, status])

  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [status, tick])

  const progress = useMemo(() => {
    if (duration <= 0) return 0
    return Math.min(100, Math.max(0, (1 - remaining / duration) * 100))
  }, [remaining, duration])

  const formatted = useMemo(() => formatTime(remaining), [remaining])

  return (
    <div
      className={['timer-display', `timer--${visual}`, className].filter(Boolean).join(' ')}
      role="timer"
      aria-live="polite"
      aria-label={ariaLabel ?? `Question timer, ${formatted} remaining`}
    >
      <div className="timer__value">{formatted}</div>
      <div className="timer__progress-wrap">
        <div className={`timer__progress timer--${visual}`} style={{ width: `${progress}%` }} />
      </div>
      {visual === 'expired' && (
        <span className="timer__status" aria-hidden="true">
          Time expired
        </span>
      )}
    </div>
  )
}
