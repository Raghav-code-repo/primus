import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="page page--centered">
      <section className="card card--message" aria-labelledby="not-found-heading">
        <p className="page__eyebrow">404</p>
        <h1 className="page__title" id="not-found-heading">
          Page not found
        </h1>
        <p className="card__text">
          The address you opened does not exist in this application.
        </p>
        <div className="card__actions">
          <Link className="button button--primary" to="/dashboard">
            Go to dashboard
          </Link>
        </div>
      </section>
    </div>
  )
}
