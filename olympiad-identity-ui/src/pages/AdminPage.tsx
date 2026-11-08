import { useEffect, useState } from 'react'

import { Alert } from '../components/Alert'
import { adminApi } from '../api/adminApi'
import { ApiError } from '../api/errors'
import type {
  AdminUserResponse,
  PermissionResponse,
  RoleResponse,
} from '../types/auth'

type LoadState<T extends readonly unknown[]> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'forbidden'; message: string }
  | { status: 'error'; message: string }
const INITIAL_USERS: LoadState<AdminUserResponse[]> = { status: 'loading' }
const INITIAL_ROLES: LoadState<RoleResponse[]> = { status: 'loading' }
const INITIAL_PERMISSIONS: LoadState<PermissionResponse[]> = { status: 'loading' }

function toLoadState<T extends readonly unknown[]>(
  error: unknown,
): LoadState<T> {
  if (error instanceof ApiError) {
    if (error.isForbidden) {
      return { status: 'forbidden', message: error.message }
    }
    if (error.isUnauthorized) {
      return {
        status: 'error',
        message: 'Your session is no longer valid. Please sign in again.',
      }
    }
    return { status: 'error', message: error.message }
  }
  return {
    status: 'error',
    message: 'The Identity Service could not be reached.',
  }
}

export function AdminPage() {
  const [users, setUsers] = useState<LoadState<AdminUserResponse[]>>(INITIAL_USERS)
  const [roles, setRoles] = useState<LoadState<RoleResponse[]>>(INITIAL_ROLES)
  const [permissions, setPermissions] =
    useState<LoadState<PermissionResponse[]>>(INITIAL_PERMISSIONS)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let active = true

    Promise.allSettled([
      adminApi.listUsers(),
      adminApi.listRoles(),
      adminApi.listPermissions(),
    ]).then(([usersResult, rolesResult, permissionsResult]) => {
      if (!active) {
        return
      }
      setUsers(
        usersResult.status === 'fulfilled'
          ? { status: 'ready', data: usersResult.value }
          : toLoadState<AdminUserResponse[]>(usersResult.reason),
      )
      setRoles(
        rolesResult.status === 'fulfilled'
          ? { status: 'ready', data: rolesResult.value }
          : toLoadState<RoleResponse[]>(rolesResult.reason),
      )
      setPermissions(
        permissionsResult.status === 'fulfilled'
          ? { status: 'ready', data: permissionsResult.value }
          : toLoadState<PermissionResponse[]>(permissionsResult.reason),
      )
    })

    return () => {
      active = false
    }
  }, [reloadToken])

  const handleReload = () => {
    setUsers(INITIAL_USERS)
    setRoles(INITIAL_ROLES)
    setPermissions(INITIAL_PERMISSIONS)
    setReloadToken((token) => token + 1)
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="page__eyebrow">Administration</p>
          <h1 className="page__title">Users, roles and permissions</h1>
        </div>
        <button
          type="button"
          className="button button--secondary"
          onClick={handleReload}
        >
          Reload
        </button>
      </header>

      <Alert variant="info" title="Server-side authorization">
        These panels call the protected admin endpoints of the Identity Service.
        Hiding a link in the navigation is a usability feature only - the
        backend rejects every request that the signed-in account is not
        allowed to perform.
      </Alert>

      <section className="card" aria-labelledby="admin-users-heading">
        <h2 className="card__title" id="admin-users-heading">
          Users
        </h2>
        <ResourceBlock state={users} emptyText="No users returned.">
          {(data) => (
            <div className="table-wrapper">
              <table className="table">
                <caption className="sr-only">Registered users</caption>
                <thead>
                  <tr>
                    <th scope="col">Email</th>
                    <th scope="col">Name</th>
                    <th scope="col">Status</th>
                    <th scope="col">Roles</th>
                    <th scope="col">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((account) => (
                    <tr key={account.id}>
                      <td>{account.email}</td>
                      <td>
                        {account.firstName} {account.lastName}
                      </td>
                      <td>{account.status}</td>
                      <td>
                        {account.roles.length > 0
                          ? account.roles.join(', ')
                          : '—'}
                      </td>
                      <td>{account.emailVerified ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ResourceBlock>
      </section>

      <div className="card-grid">
        <section className="card" aria-labelledby="admin-roles-heading">
          <h2 className="card__title" id="admin-roles-heading">
            Roles
          </h2>
          <ResourceBlock state={roles} emptyText="No roles returned.">
            {(data) => (
              <ul className="tag-list">
                {data.map((role) => (
                  <li key={role.id}>
                    <span className="badge">{role.name}</span>
                    {role.description ? (
                      <span className="tag-list__description">
                        {role.description}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </ResourceBlock>
        </section>

        <section className="card" aria-labelledby="admin-permissions-heading">
          <h2 className="card__title" id="admin-permissions-heading">
            Permissions
          </h2>
          <ResourceBlock
            state={permissions}
            emptyText="No permissions returned."
          >
            {(data) => (
              <ul className="tag-list">
                {data.map((permission) => (
                  <li key={permission.id}>
                    <span className="badge">{permission.code}</span>
                    {permission.description ? (
                      <span className="tag-list__description">
                        {permission.description}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </ResourceBlock>
        </section>
      </div>
    </div>
  )
}

interface ResourceBlockProps<T extends readonly unknown[]> {
  state: LoadState<T>
  emptyText: string
  children: (data: T) => React.ReactNode
}

function ResourceBlock<T extends readonly unknown[]>({
  state,
  emptyText,
  children,
}: ResourceBlockProps<T>) {
  if (state.status === 'loading') {
    return (
      <p className="card__text" role="status">
        Loading…
      </p>
    )
  }

  if (state.status === 'forbidden') {
    return (
      <Alert variant="error" title="Access denied">
        {state.message} This account is signed in, but the Identity Service did
        not grant the permission that this endpoint requires.
      </Alert>
    )
  }

  if (state.status === 'error') {
    return (
      <Alert variant="warning" title="Could not load the data">
        {state.message}
      </Alert>
    )
  }

  if (state.data.length === 0) {
    return <p className="card__text">{emptyText}</p>
  }

  return <>{children(state.data)}</>
}
