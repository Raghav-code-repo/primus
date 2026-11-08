/**
 * Types mirroring the Identity Service DTOs.
 * Source of truth: com.olympiad.identity.dto.* and
 * com.olympiad.identity.dto.response.* (Spring Boot 4 / Java 21).
 */

/** `AuthResponse.UserProfile` - returned by POST /api/auth/login, /register and GET /api/auth/me. */
export interface AuthUserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

/** `AuthResponse` - returned by POST /api/auth/login and POST /api/auth/register. */
export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: AuthUserProfile
}

/** `LoginRequest` body of POST /api/auth/login. */
export interface LoginRequest {
  email: string
  password: string
}

/** `RegisterRequest` body of POST /api/auth/register. */
export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

/**
 * `CurrentAuthoritiesResponse` - returned by GET /api/auth/permissions.
 *
 * The Identity Service builds the authorities from the roles of the account
 * (`ROLE_<role>`) plus the permissions mapped to those roles
 * (for example `COURSE_READ`). The Course Service uses exactly this list to
 * authorize its own requests.
 */
export interface CurrentAuthoritiesResponse {
  subject: string
  authorities: string[]
}

/** `UserResponse` - returned by the admin user endpoints under /api/admin/users. */
export interface AdminUserResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  status: string
  emailVerified: boolean
  roles: string[]
  createdAt: string
}

/** `RoleResponse` - returned by GET /api/admin/roles. */
export interface RoleResponse {
  id: string
  name: string
  description: string | null
  active: boolean
}

/** `PermissionResponse` - returned by GET /api/admin/permissions. */
export interface PermissionResponse {
  id: string
  code: string
  description: string | null
  active: boolean
}
