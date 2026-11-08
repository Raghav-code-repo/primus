import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'

export function UnauthorizedPage() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const from =
    typeof location.state === 'object' &&
    location.state !== null &&
    typeof (location.state as { from?: unknown }).from === 'string'
      ? (location.state as { from: string }).from
      : null

  return (
    <div className="page page--centered">
      <section className="card card--message" aria-labelledby="unauthorized-heading">
        <p className="page__eyebrow">403</p>
        <h1 className="page__title" id="unauthorized-heading">
          Access denied
        </h1>
        <p className="card__text">
          Your account does not have the role that is required for this page.
        </p>
        {from ? (
          <p className="card__hint">
            The page you requested was <code>{from}</code>.
          </p>
        ) : null}
        <div className="card__actions">
          {isAuthenticated ? (
            <Link className="button button--primary" to="/dashboard">
              Back to dashboard
            </Link>
          ) : (
            <Link className="button button--primary" to="/login">
              Sign in
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
