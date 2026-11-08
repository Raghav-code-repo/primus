import { apiClient } from './client'
import type {
  AuthResponse,
  AuthUserProfile,
  CurrentAuthoritiesResponse,
  LoginRequest,
  RegisterRequest,
} from '../types/auth'

/**
 * Endpoints of `AuthController` (com.olympiad.identity.controller.AuthController)
 * and `CurrentAuthoritiesController`
 * (com.olympiad.identity.controller.CurrentAuthoritiesController).
 * All paths are relative to the Identity Service base URL.
 */
export interface AuthApi {
  /** POST /api/auth/register - public, returns 201 with an AuthResponse. */
  register(payload: RegisterRequest): Promise<AuthResponse>
  /** POST /api/auth/login - public, returns 200 with an AuthResponse. */
  login(payload: LoginRequest): Promise<AuthResponse>
  /** GET /api/auth/me - authenticated, returns the current UserProfile. */
  me(): Promise<AuthUserProfile>
  /**
   * GET /api/auth/permissions - authenticated, returns the current subject and
   * the authorities (roles and permissions) of the signed-in account.
   */
  permissions(): Promise<CurrentAuthoritiesResponse>
}

export const authApi: AuthApi = {
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/register',
      payload,
    )
    return response.data
  },

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/api/auth/login',
      payload,
    )
    return response.data
  },

  async me(): Promise<AuthUserProfile> {
    const response = await apiClient.get<AuthUserProfile>('/api/auth/me')
    return response.data
  },

  async permissions(): Promise<CurrentAuthoritiesResponse> {
    const response = await apiClient.get<CurrentAuthoritiesResponse>(
      '/api/auth/permissions',
    )
    return response.data
  },
}
