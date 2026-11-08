import { type ReactNode } from 'react'

export interface CardProps {
  children?: ReactNode
  className?: string
  padded?: boolean
}

export function Card({ children, className, padded = true }: CardProps) {
  return (
    <div
      className={[
        'card',
        padded ? 'card--padded' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
