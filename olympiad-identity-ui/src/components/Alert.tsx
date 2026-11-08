import type { ReactNode } from 'react'

export type AlertVariant = 'error' | 'success' | 'info' | 'warning'

interface AlertProps {
  variant: AlertVariant
  title?: string
  children?: ReactNode
}

export function Alert({ variant, title, children }: AlertProps) {
  return (
    <div
      className={`alert alert--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      {title ? <p className="alert__title">{title}</p> : null}
      {children ? <div className="alert__body">{children}</div> : null}
    </div>
  )
}
