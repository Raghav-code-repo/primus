/**
 * Role helpers.
 *
 * The Identity Service stores role names without a prefix (`ADMIN`, `TEACHER`,
 * `STUDENT` - see V2__seed_initial_rbac.sql) and returns those raw names in
 * `AuthResponse.UserProfile.roles` and `UserResponse.roles`.
 *
 * Spring Security authorities are built as `ROLE_` + role name
 * (RbacAuthorityService), so the `ROLE_` prefix exists only on the server side.
 * `normalizeRole` accepts both shapes so comparisons stay correct regardless of
 * the prefix the backend chooses to expose.
 */

export const ROLE_ADMIN = 'ADMIN'
export const ROLE_TEACHER = 'TEACHER'
export const ROLE_STUDENT = 'STUDENT'

/**
 * The Identity Service seeds only `STUDENT`, `TEACHER` and `ADMIN`
 * (V2__seed_initial_rbac.sql). There is no parent role and no parent to
 * student relationship in the backend, so a parent dashboard can only report
 * that the capability does not exist yet.
 */
export const ROLE_PARENT = 'PARENT'

export const KNOWN_ROLES = [
  ROLE_ADMIN,
  ROLE_TEACHER,
  ROLE_STUDENT,
  ROLE_PARENT,
] as const

export type KnownRole = (typeof KNOWN_ROLES)[number]

export function normalizeRole(role: string): string {
  return role.replace(/^ROLE_/i, '').trim().toUpperCase()
}

export function hasRole(
  roles: readonly string[] | undefined | null,
  role: KnownRole | string,
): boolean {
  if (!roles || roles.length === 0) {
    return false
  }
  const target = normalizeRole(role)
  return roles.some((candidate) => normalizeRole(candidate) === target)
}

export function isAdmin(roles: readonly string[] | undefined | null): boolean {
  return hasRole(roles, ROLE_ADMIN)
}

export function isStudent(roles: readonly string[] | undefined | null): boolean {
  return hasRole(roles, ROLE_STUDENT)
}

/** The teaching staff role of the Identity Service. */
export function isTeacher(roles: readonly string[] | undefined | null): boolean {
  return hasRole(roles, ROLE_TEACHER)
}

export function isParent(roles: readonly string[] | undefined | null): boolean {
  return hasRole(roles, ROLE_PARENT)
}
