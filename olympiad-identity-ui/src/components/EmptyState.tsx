import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: ReactNode
  action?: ReactNode
}

/**
 * The state of a list that holds no entries. It always explains what happened
 * and offers the next step when there is one.
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h3 className="empty-state__title">{title}</h3>
      {description ? (
        <div className="empty-state__description">{description}</div>
      ) : null}
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  )
}
