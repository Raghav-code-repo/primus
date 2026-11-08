interface SkeletonProps {
  /** Number of skeleton lines. */
  lines?: number
  label?: string
}

/**
 * A loading placeholder. The label is announced to screen readers, the bars
 * themselves are hidden from them.
 */
export function Skeleton({ lines = 3, label = 'Loading' }: SkeletonProps) {
  return (
    <div className="skeleton" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: lines }, (_, index) => (
        <span
          className="skeleton__line"
          key={index}
          aria-hidden="true"
          style={{ width: `${100 - index * 12}%` }}
        />
      ))}
    </div>
  )
}
