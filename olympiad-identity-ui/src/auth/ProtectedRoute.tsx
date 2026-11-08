import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

import { LoadingScreen } from '../components/LoadingScreen'
import { useAuth } from './useAuth'
import { hasRole } from './roles'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Renders `children` only for an authenticated session. While the session is
 * being restored the loading screen is shown, so the user never sees a
 * redirect to the login page caused by an unfinished restoration.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'initializing') {
    return <LoadingScreen label="Restoring your session" />
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return <>{children}</>
}

interface PublicOnlyRouteProps {
  children: ReactNode
}

/** Keeps signed-in users away from the login and registration pages. */
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { status } = useAuth()

  if (status === 'initializing') {
    return <LoadingScreen label="Restoring your session" />
  }

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

interface RequireRoleProps {
  children: ReactNode
  role: string
}

/**
 * Frontend guard for role based navigation. This is a usability feature only:
 * the Identity Service remains the authority that enforces authorization.
 */
export function RequireRole({ children, role }: RequireRoleProps) {
  const { roles } = useAuth()

  if (!hasRole(roles, role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

interface RequirePermissionProps {
  children: ReactNode
  permission: string
}

/**
 * Frontend guard for permission based navigation. The authorities are the ones
 * reported by `GET /api/auth/permissions`, so the guard follows the same
 * rules the backend applies to the request.
 */
export function RequirePermission({
  children,
  permission,
}: RequirePermissionProps) {
  const { hasPermission, status } = useAuth()

  if (status === 'initializing') {
    return <LoadingScreen label="Restoring your session" />
  }

  if (!hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
