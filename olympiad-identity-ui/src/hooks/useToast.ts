import { createContext, useContext, type ReactNode } from 'react'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  variant: ToastVariant
  title?: string
  description?: ReactNode
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export { ToastContext }
export type { ToastContextValue }
