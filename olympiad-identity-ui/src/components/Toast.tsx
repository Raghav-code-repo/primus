import { useCallback, useState, type ReactNode } from 'react'

import { ToastContext, type Toast, type ToastContextValue } from '../hooks/useToast'

const TOAST_LIMIT = 5
const DEFAULT_DURATION_MS = 5000

let count = 0

function genId(): string {
  count = (count + 1) % 1_000_000
  return `toast-${count}`
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    (item: Omit<Toast, 'id'>) => {
      const id = genId()
      setToasts((current) => {
        const next = [...current, { ...item, id }]
        return next.slice(-TOAST_LIMIT)
      })

      const duration = item.duration ?? DEFAULT_DURATION_MS
      if (duration > 0) {
        setTimeout(() => {
          setToasts((current) => current.filter((t) => t.id !== id))
        }, duration)
      }
    },
    [],
  )

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const value: ToastContextValue = { toasts, toast, dismiss }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastArea toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

interface ToastAreaProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

function ToastArea({ toasts, onDismiss }: ToastAreaProps) {
  return (
    <div
      className="toast-area"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toastItem) => (
        <div
          key={toastItem.id}
          className={`toast toast--${toastItem.variant}`}
          role="alert"
          aria-live="assertive"
        >
          {toastItem.title ? (
            <div className="toast__title">{toastItem.title}</div>
          ) : null}
          {toastItem.description ? (
            <div className="toast__description">{toastItem.description}</div>
          ) : null}
          <button
            type="button"
            className="toast__dismiss"
            aria-label="Dismiss"
            onClick={() => onDismiss(toastItem.id)}
          >
            <span aria-hidden="true">&#215;</span>
          </button>
        </div>
      ))}
    </div>
  )
}
