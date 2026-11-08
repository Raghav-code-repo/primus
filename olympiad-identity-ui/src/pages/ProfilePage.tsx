import { useState } from 'react'

import { Alert } from '../components/Alert'

import { useAuth } from '../auth/useAuth'
import { normalizeRole } from '../auth/roles'
import { splitAuthorities } from '../auth/permissions'
import { ApiError } from '../api/errors'

export function ProfilePage() {
  const { user, roles, authorities, authoritiesError, refreshProfile, refreshAuthorities } =
    useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshed, setRefreshed] = useState(false)

  const { permissions, roles: authorityRoles } = splitAuthorities(authorities)

  const handleRefresh = async () => {
    setRefreshing(true)
    setError(null)
    setRefreshed(false)
    try {
      await refreshProfile()
      await refreshAuthorities()
      setRefreshed(true)
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : 'The profile could not be refreshed.',
      )
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="page__eyebrow">Profile</p>
          <h1 className="page__title">Your account</h1>
        </div>
        <button
          type="button"
          className="button button--secondary"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing…' : 'Refresh profile'}
        </button>
      </header>

      {error ? (
        <Alert variant="error" title="Could not refresh the profile">
          {error}
        </Alert>
      ) : null}

      {refreshed ? (
        <Alert variant="success" title="Profile updated">
          The profile was reloaded from <code>GET /api/auth/me</code>.
        </Alert>
      ) : null}

      <section className="card" aria-labelledby="profile-heading">
        <h2 className="card__title" id="profile-heading">
          Identity
        </h2>
        <dl className="detail-list">
          <div className="detail-list__row">
            <dt>User ID</dt>
            <dd className="detail-list__mono">{user?.id ?? '—'}</dd>
          </div>
          <div className="detail-list__row">
            <dt>First name</dt>
            <dd>{user?.firstName ?? '—'}</dd>
          </div>
          <div className="detail-list__row">
            <dt>Last name</dt>
            <dd>{user?.lastName ?? '—'}</dd>
          </div>
          <div className="detail-list__row">
            <dt>Email</dt>
            <dd>{user?.email ?? '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="card" aria-labelledby="profile-roles-heading">
        <h2 className="card__title" id="profile-roles-heading">
          Roles
        </h2>
        {roles.length === 0 ? (
          <p className="card__text">No role is assigned to this account.</p>
        ) : (
          <ul className="role-list">
            {roles.map((role) => (
              <li className="role-list__item" key={role}>
                <span className="badge">{normalizeRole(role)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="card__hint">
          The Identity Service exposes roles on the current-user endpoint. The
          permissions that are mapped to those roles are read from{' '}
          <code>GET /api/auth/permissions</code> and are listed below. The
          profile does not contain the account status.
        </p>
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

      <section className="card" aria-labelledby="profile-permissions-heading">
        <h2 className="card__title" id="profile-permissions-heading">
          Permissions
        </h2>
        {authoritiesError ? (
          <Alert variant="warning" title="Authorities unavailable">
            {authoritiesError}
          </Alert>
        ) : null}
        {permissions.length === 0 ? (
          <p className="card__text">
            No permission is mapped to the roles of this account.
          </p>
        ) : (
          <ul className="role-list">
            {permissions.map((permission) => (
              <li className="role-list__item" key={permission}>
                <span className="badge">{permission}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="card__hint">
          The permissions decide which course actions the interface offers.
          The Course Service authorizes every request on the server as well.
        </p>
      </section>

      </div>
  )
}
