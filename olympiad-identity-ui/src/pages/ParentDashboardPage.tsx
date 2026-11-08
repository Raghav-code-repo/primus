import { Link } from 'react-router-dom'

import { Alert } from '../components/Alert'
import { EmptyState } from '../components/EmptyState'
import { useAuth } from '../auth/useAuth'

/**
 * The dashboard of a parent account.
 *
 * The backend does not support parents yet: the Identity Service seeds only
 * the roles `STUDENT`, `TEACHER` and `ADMIN`, there is no parent to student
 * relationship in the data model and the Student Service only exposes the
 * profile of the signed-in user (`/api/students/me`). The page therefore
 * states that clearly instead of simulating linked students.
 */
export function ParentDashboardPage() {
  const { user, roles } = useAuth()

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'Parent'

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="page__eyebrow">Parent dashboard</p>
          <h1 className="page__title">Welcome back, {displayName}</h1>
        </div>
      </header>

      <Alert variant="info" title="Coming soon">
        The backend does not support parent accounts yet. This page describes
        what is missing instead of showing data that does not exist.
      </Alert>

      <section className="card" aria-labelledby="parent-account-heading">
        <h2 className="card__title" id="parent-account-heading">
          Your account
        </h2>
        <dl className="detail-list">
          <div className="detail-list__row">
            <dt>Name</dt>
            <dd>{user ? `${user.firstName} ${user.lastName}` : '—'}</dd>
          </div>
          <div className="detail-list__row">
            <dt>Email</dt>
            <dd>{user?.email ?? '—'}</dd>
          </div>
          <div className="detail-list__row">
            <dt>Roles</dt>
            <dd>{roles.length > 0 ? roles.join(', ') : '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="card" aria-labelledby="parent-linked-heading">
        <h2 className="card__title" id="parent-linked-heading">
          Linked students
        </h2>
        <EmptyState
          title="Not available"
          description={
            <>
              <p>
                The Identity Service seeds only the roles <code>STUDENT</code>,{' '}
                <code>TEACHER</code> and <code>ADMIN</code>. There is no parent
                role and no relationship between a parent account and a
                student account.
              </p>
              <p>
                The Student Service only answers <code>GET /api/students/me</code>{' '}
                with the profile of the signed-in user. It cannot return the
                profile of another student, and it does not authorise a
                different account to read it either.
              </p>
              <p>
                To offer this view, the backend would need a parent role, a
                link between a parent account and a student account and an
                endpoint that returns the linked students - guarded by that
                link.
              </p>
            </>
          }
        />
      </section>

      <section className="card" aria-labelledby="parent-courses-heading">
        <h2 className="card__title" id="parent-courses-heading">
          Courses and enrollments
        </h2>
        <EmptyState
          title="Not available"
          description={
            <p>
              The enrollment endpoints of the Student Service are bound to the
              signed-in identity, so they can only ever return the enrollments
              of the signed-in account. They cannot be used to read the
              enrollments of a linked student.
            </p>
          }
          action={
            <Link className="button button--secondary" to="/courses">
              Open the course catalogue
            </Link>
          }
        />
      </section>
    </div>
  )
}
