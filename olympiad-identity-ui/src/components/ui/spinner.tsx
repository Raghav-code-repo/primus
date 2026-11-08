import { type ReactNode } from 'react'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <div
      className={['spinner-wrap', `spinner-wrap--${size}`, className]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-label={label ?? 'Loading'}
    >
      <div className="spinner" aria-hidden="true" />
      {label ? <span className="spinner__label">{label}</span> : null}
    </div>
  )
}

export interface LoadingStateProps {
  children?: ReactNode
  message?: string
}

export function LoadingState({ children, message }: LoadingStateProps) {
  return (
    <div className="loading-state">
      {children ?? <Spinner size="md" label={message ?? 'Loading…'} />}
    </div>
  )
}
