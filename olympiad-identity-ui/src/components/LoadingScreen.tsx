export function LoadingScreen({ label }: { label?: string }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p className="loading-screen__label">{label ?? 'Loading'}</p>
    </div>
  )
}
