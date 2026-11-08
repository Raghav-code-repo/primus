import { createContext } from 'react'
import type { ReactNode } from 'react'

import type { AuthApi } from '../api/authApi'
import type { AuthResponse, AuthUserProfile, LoginRequest, RegisterRequest } from '../types/auth'

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  /** 'initializing' while the session is being restored on start-up. */
  status: AuthStatus
  user: AuthUserProfile | null
  /** Role names of the account, as returned by GET /api/auth/me. */
  roles: string[]
  /**
   * Authorities of the account as returned by GET /api/auth/permissions:
   * `ROLE_*` entries for the roles and the permission codes mapped to them.
   */
  authorities: string[]
  isAuthenticated: boolean
  /** True when the last session ended because the backend rejected the token. */
  sessionExpired: boolean
  /** Message of the last failure while loading the authorities, if any. */
  authoritiesError: string | null
  login(payload: LoginRequest): Promise<void>
  register(payload: RegisterRequest): Promise<AuthResponse>
  logout(): void
  refreshProfile(): Promise<void>
  /** Reloads the authorities from the Identity Service. */
  refreshAuthorities(): Promise<void>
  clearSessionExpired(): void
  /** True when the account owns the given permission, e.g. `COURSE_READ`. */
  hasPermission(permission: string): boolean
  /** True when the account owns at least one of the given permissions. */
  hasAnyPermission(permissions: readonly string[]): boolean
  /** True when the account owns the given role, e.g. `ADMIN`. */
  hasRole(role: string): boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export interface AuthProviderProps {
  children: ReactNode
  /** Injectable API, defaults to the real Identity Service client. */
  api?: AuthApi
}
