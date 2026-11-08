import { type ReactNode } from 'react'

export interface BadgeProps {
  children?: ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={[
        'badge',
        `badge--${variant}`,
        `badge--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
