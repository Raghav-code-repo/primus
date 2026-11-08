import type { ReactNode } from 'react'

import { useAuth } from './useAuth'
import { hasRole } from './roles'

interface GuardProps {
  children: ReactNode
  /** Rendered instead of the children when the guard does not pass. */
  fallback?: ReactNode
}

/**
 * Renders the children only when the signed-in account owns the given
 * permission, for example `COURSE_CREATE`.
 *
 * The permission is read from `GET /api/auth/permissions`, so the interface
 * follows exactly the authorities the backend reports. The guard is a
 * usability feature: the backend checks every protected request again.
 */
export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: GuardProps & { permission: string }) {
  const { hasPermission } = useAuth()

  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Renders the children only when the signed-in account owns the given role.
 * The role is read from `GET /api/auth/me`.
 */
export function RoleGuard({
  role,
  children,
  fallback = null,
}: GuardProps & { role: string }) {
  const { roles } = useAuth()

  if (!hasRole(roles, role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
