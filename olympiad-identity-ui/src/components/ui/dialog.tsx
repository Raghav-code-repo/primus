import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { type ReactNode } from 'react'

export interface DialogContentProps {
  open: boolean
  onClose: () => void
  title?: string
  className?: string
  children?: ReactNode
}

interface DialogContextValue {
  open: boolean
  onClose: () => void
}

const DialogContext = createContext<DialogContextValue | null>(null)

export function DialogProvider({
  children,
  open,
  onClose,
}: {
  children: ReactNode
  open: boolean
  onClose: () => void
}) {
  return (
    <DialogContext.Provider value={{ open, onClose }}>{children}</DialogContext.Provider>
  )
}

export function DialogContent({
  open,
  onClose,
  title,
  className,
  children,
}: DialogContentProps) {
  const context = useContext(DialogContext)
  const isOpen = open ?? (context?.open ?? false)
  const handleClose = useMemo(() => onClose ?? context?.onClose, [onClose, context])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isOpen) setMounted(true)
    return () => setMounted(false)
  }, [isOpen])

  if (!isOpen && !mounted) return null

  return (
    <>
      <div
        className={`dialog__backdrop ${isOpen ? 'dialog__backdrop--open' : ''}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? undefined}
        className={`dialog ${isOpen ? 'dialog--open' : ''} ${className ?? ''}`}
      >
        {title ? <h2 className="dialog__title">{title}</h2> : null}
        <button
          type="button"
          className="dialog__close"
          onClick={handleClose}
          aria-label="Close"
        >
          <span aria-hidden="true">×</span>
          <span className="sr-only">Close</span>
        </button>
        <div className="dialog__body">{children}</div>
      </div>
    </>
  )
}

export function useDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useDialog must be used inside a DialogProvider')
  }
  return context
}
