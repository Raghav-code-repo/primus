import { Link, Navigate } from 'react-router-dom'

import { Alert } from '../components/Alert'

import { useAuth } from '../auth/useAuth'
import { normalizeRole } from '../auth/roles'
import { splitAuthorities } from '../auth/permissions'
import { dashboardRouteForRoles } from '../config/navigation'

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN:
    'Administrator. Management endpoints additionally require backend permissions such as USER_READ, USER_CREATE, USER_UPDATE, USER_DELETE, ROLE_ASSIGN or PERMISSION_MANAGE.',
  TEACHER:
    'Teaching staff. The Identity Service decides which resources a teacher role may reach through the permissions assigned to the role.',
  STUDENT:
    'Learner. The Identity Service decides which resources a student role may reach through the permissions assigned to the role.',
  PARENT:
    'Parent. The Identity Service does not seed this role yet, so the backend cannot offer any parent specific data.',
}

/**
 * The entry point of the signed-in account.
 *
 * The dashboard that matches the roles of the account is opened, so a student
 * lands on the student dashboard and an administrator on the admin dashboard.
 * The roles come from `GET /api/auth/me` - the browser never sends them.
 */
export function DashboardPage() {
  const { roles } = useAuth()
  const target = dashboardRouteForRoles(roles)

  if (target) {
    return <Navigate to={target} replace />
  }

  return <AccountOverview />
}

/**
 * The account overview for an account that holds no role the backend knows.
 * It shows the identity and the authorities that were reported for it.
 */
function AccountOverview() {
  const { user, roles, authorities, authoritiesError } = useAuth()

  const { roles: authorityRoles, permissions } = splitAuthorities(authorities)

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'Signed-in user'

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="page__eyebrow">Dashboard</p>
          <h1 className="page__title">Welcome back, {displayName}</h1>
        </div>
      </header>

      <Alert variant="info" title="No dashboard for this account">
        The Identity Service did not assign a role that has its own dashboard to
        this account. The pages of the academy are listed in the navigation.
      </Alert>

      <div className="card-grid">
        <section className="card" aria-labelledby="account-heading">
          <h2 className="card__title" id="account-heading">
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
              <dt>User ID</dt>
              <dd className="detail-list__mono">{user?.id ?? '—'}</dd>
            </div>
          </dl>
          <p className="card__hint">
            <Link className="link" to="/profile">
              Open your account page
            </Link>
          </p>
        </section>

        <section className="card" aria-labelledby="roles-heading">
          <h2 className="card__title" id="roles-heading">
            Roles
          </h2>
          {roles.length === 0 ? (
            <p className="card__text">
              The Identity Service did not assign a role to this account.
            </p>
          ) : (
            <ul className="role-list">
              {roles.map((role) => (
                <li className="role-list__item" key={role}>
                  <span className="badge">{normalizeRole(role)}</span>
                  <p className="role-list__description">
                    {ROLE_DESCRIPTIONS[normalizeRole(role)] ??
                      'Role assigned by the Identity Service.'}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="card__hint">
            Roles come from <code>GET /api/auth/me</code>. The permissions that
            are mapped to those roles are listed on the account page and are
            read from <code>GET /api/auth/permissions</code>.
          </p>
        </section>
      </div>

      {authoritiesError ? (
        <Alert variant="warning" title="Authorities unavailable">
          {authoritiesError}
        </Alert>
      ) : null}

      {permissions.length > 0 ? (
        <section className="card" aria-labelledby="authorities-heading">
          <h2 className="card__title" id="authorities-heading">
            Authorities
          </h2>
          <ul className="tag-list">
            {permissions.map((permission) => (
              <li key={permission}>
                <span className="badge">{permission}</span>
              </li>
            ))}
          </ul>
          {authorityRoles.length > 0 ? (
            <p className="card__hint">
              Roles reported as authorities:{' '}
              {authorityRoles.map((role) => (
                <span className="badge" key={role}>
                  ROLE_{role}
                </span>
              ))}
            </p>
          ) : null}
        </section>
      ) : null}

      </div>
  )
}
