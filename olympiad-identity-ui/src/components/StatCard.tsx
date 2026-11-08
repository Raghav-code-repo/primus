import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: ReactNode
}

/** A single number of a dashboard, for example the number of enrollments. */
export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="stat-card">
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      {hint ? <p className="stat-card__hint">{hint}</p> : null}
    </div>
  )
}
