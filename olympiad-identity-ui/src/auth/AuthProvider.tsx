import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { authApi as defaultAuthApi } from '../api/authApi'
import { setUnauthorizedHandler } from '../api/client'
import { ApiError } from '../api/errors'
import {
  AuthContext,
  type AuthContextValue,
  type AuthProviderProps,
  type AuthStatus,
} from './AuthContext'
import {
  hasAnyPermission as hasAnyPermissionOf,
  hasPermission as hasPermissionOf,
  hasRole as hasRoleOf,
} from './permissions'
import {
  clearSession,
  getSession,
  isExpired,
  setSession,
} from './tokenStorage'
import type { AuthResponse, AuthUserProfile, LoginRequest, RegisterRequest } from '../types/auth'

function initialStatus(): AuthStatus {
  const session = getSession()
  if (!session || isExpired(session)) {
    return 'unauthenticated'
  }
  return 'initializing'
}

export function AuthProvider({ children, api = defaultAuthApi }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>(initialStatus)
  const [user, setUser] = useState<AuthUserProfile | null>(null)
  const [authorities, setAuthorities] = useState<string[]>([])
  const [authoritiesError, setAuthoritiesError] = useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const restoreRequest = useRef<Promise<AuthUserProfile> | null>(null)

  const clearLocalSession = useCallback(() => {
    clearSession()
    setUser(null)
    setAuthorities([])
    setAuthoritiesError(null)
    setStatus('unauthenticated')
  }, [])

  /**
   * Loads the authorities of the signed-in account. A failure of the
   * permissions endpoint must not end the session: only a rejected token
   * (401) does. Every other error leaves the session active and is reported
   * so the interface can explain why no permission based action is shown.
   */
  const loadAuthorities = useCallback(async (): Promise<string[]> => {
    try {
      const response = await api.permissions()
      const loaded = Array.isArray(response?.authorities)
        ? response.authorities
        : []
      setAuthorities(loaded)
      setAuthoritiesError(null)
      return loaded
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) {
        throw error
      }
      setAuthorities([])
      setAuthoritiesError(
        error instanceof ApiError
          ? error.message
          : 'The authorities could not be loaded from the Identity Service.',
      )
      return []
    }
  }, [api])

  useEffect(() => {
    let active = true

    const stored = getSession()

    if (!stored) {
      return () => {
        active = false
      }
    }

    if (isExpired(stored)) {
      clearSession()
      return () => {
        active = false
      }
    }

    if (!restoreRequest.current) {
      restoreRequest.current = api.me()
    }

    restoreRequest.current
      .then(async (profile) => {
        if (!active) {
          return
        }
        // The authorities are loaded before the session is announced, so a
        // rejected token never flashes a protected page.
        await loadAuthorities()
        if (!active) {
          return
        }
        setUser(profile)
        setSessionExpired(false)
        setStatus('authenticated')
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }
        clearLocalSession()
        setSessionExpired(
          error instanceof ApiError ? error.status === 401 : false,
        )
      })

    return () => {
      active = false
    }
  }, [api, clearLocalSession, loadAuthorities])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearLocalSession()
      setSessionExpired(true)
    })
    return () => setUnauthorizedHandler(null)
  }, [clearLocalSession])

  const establishSession = useCallback(
    async (response: AuthResponse): Promise<void> => {
      const expiresInSeconds = Number.isFinite(response.expiresIn)
        ? response.expiresIn
        : 0
      const expiresAt = Date.now() + expiresInSeconds * 1000

      setSession({
        accessToken: response.accessToken,
        tokenType: response.tokenType || 'Bearer',
        expiresAt,
      })

      try {
        const profile = await api.me()
        await loadAuthorities()
        setUser(profile)
        setSessionExpired(false)
        setStatus('authenticated')
      } catch (error) {
        clearLocalSession()
        throw error
      }
    },
    [api, clearLocalSession, loadAuthorities],
  )

  const login = useCallback(
    async (payload: LoginRequest): Promise<void> => {
      const response = await api.login(payload)
      await establishSession(response)
    },
    [api, establishSession],
  )

  const register = useCallback(
    async (payload: RegisterRequest): Promise<AuthResponse> => {
      const response = await api.register(payload)
      if (response && response.accessToken) {
        await establishSession(response)
      } else {
        clearLocalSession()
      }
      return response
    },
    [api, clearLocalSession, establishSession],
  )

  const logout = useCallback(() => {
    clearLocalSession()
    setSessionExpired(false)
  }, [clearLocalSession])

  const refreshProfile = useCallback(async (): Promise<void> => {
    const profile = await api.me()
    setUser(profile)
  }, [api])

  const refreshAuthorities = useCallback(async (): Promise<void> => {
    await loadAuthorities()
  }, [loadAuthorities])

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false)
  }, [])

  const hasPermission = useCallback(
    (permission: string): boolean => hasPermissionOf(authorities, permission),
    [authorities],
  )

  const hasAnyPermission = useCallback(
    (permissions: readonly string[]): boolean =>
      hasAnyPermissionOf(authorities, permissions),
    [authorities],
  )

  const hasRole = useCallback(
    (role: string): boolean => hasRoleOf(authorities, role),
    [authorities],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      roles: user?.roles ?? [],
      authorities,
      isAuthenticated: status === 'authenticated',
      sessionExpired,
      authoritiesError,
      login,
      register,
      logout,
      refreshProfile,
      refreshAuthorities,
      clearSessionExpired,
      hasPermission,
      hasAnyPermission,
      hasRole,
    }),
    [
      status,
      user,
      authorities,
      sessionExpired,
      authoritiesError,
      login,
      register,
      logout,
      refreshProfile,
      refreshAuthorities,
      clearSessionExpired,
      hasPermission,
      hasAnyPermission,
      hasRole,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
