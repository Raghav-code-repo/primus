/**
 * Permission helpers.
 *
 * The authorities come from `GET /api/auth/permissions`, which returns the
 * Spring Security authorities of the signed-in account:
 *
 *  - `ROLE_ADMIN`, `ROLE_COURSE_MANAGER`, `ROLE_STUDENT`, ... - one entry per
 *    assigned role, built by `RbacAuthorityService` as `ROLE_` + role name.
 *  - `COURSE_READ`, `COURSE_CREATE`, `COURSE_UPDATE`, `COURSE_DELETE`, ... -
 *    one entry per permission that is mapped to one of those roles.
 *
 * The helpers below only decide what the interface shows. The backend remains
 * the component that enforces every protected request, so hiding a button is
 * a usability feature and never a security boundary.
 */

export const PERMISSION_COURSE_READ = 'COURSE_READ'
export const PERMISSION_COURSE_CREATE = 'COURSE_CREATE'
export const PERMISSION_COURSE_UPDATE = 'COURSE_UPDATE'
export const PERMISSION_COURSE_DELETE = 'COURSE_DELETE'

export const PERMISSION_LIVE_CLASS_READ = 'LIVE_CLASS_READ'
export const PERMISSION_LIVE_CLASS_CREATE = 'LIVE_CLASS_CREATE'
export const PERMISSION_LIVE_CLASS_UPDATE = 'LIVE_CLASS_UPDATE'
export const PERMISSION_LIVE_CLASS_CANCEL = 'LIVE_CLASS_CANCEL'
export const PERMISSION_LIVE_CLASS_JOIN = 'LIVE_CLASS_JOIN'

export const PERMISSION_USER_READ = 'USER_READ'
export const PERMISSION_USER_CREATE = 'USER_CREATE'
export const PERMISSION_USER_UPDATE = 'USER_UPDATE'
export const PERMISSION_ROLE_READ = 'ROLE_READ'
export const PERMISSION_ROLE_CREATE = 'ROLE_CREATE'
export const PERMISSION_PERMISSION_READ = 'PERMISSION_READ'
export const PERMISSION_PERMISSION_CREATE = 'PERMISSION_CREATE'
export const PERMISSION_ROLE_ASSIGN = 'ROLE_ASSIGN'
export const PERMISSION_MANAGE = 'PERMISSION_MANAGE'

export const LIVE_CLASS_PERMISSIONS = [
  PERMISSION_LIVE_CLASS_READ,
  PERMISSION_LIVE_CLASS_CREATE,
  PERMISSION_LIVE_CLASS_UPDATE,
  PERMISSION_LIVE_CLASS_CANCEL,
  PERMISSION_LIVE_CLASS_JOIN,
] as const

export type LiveClassPermission = (typeof LIVE_CLASS_PERMISSIONS)[number]

export const COURSE_PERMISSIONS = [
  PERMISSION_COURSE_READ,
  PERMISSION_COURSE_CREATE,
  PERMISSION_COURSE_UPDATE,
  PERMISSION_COURSE_DELETE,
] as const

export type CoursePermission = (typeof COURSE_PERMISSIONS)[number]

function normalizeAuthority(authority: string): string {
  return authority.trim().toUpperCase()
}

/**
 * True when the account owns the given permission, for example `COURSE_READ`.
 * Role authorities (`ROLE_ADMIN`) never satisfy a permission check.
 */
export function hasPermission(
  authorities: readonly string[] | undefined | null,
  permission: string,
): boolean {
  if (!authorities || authorities.length === 0) {
    return false
  }
  const target = normalizeAuthority(permission)
  return authorities.some(
    (authority) => normalizeAuthority(authority) === target,
  )
}

/** True when the account owns at least one of the given permissions. */
export function hasAnyPermission(
  authorities: readonly string[] | undefined | null,
  permissions: readonly string[],
): boolean {
  return permissions.some((permission) => hasPermission(authorities, permission))
}

/** True when the account owns every one of the given permissions. */
export function hasAllPermissions(
  authorities: readonly string[] | undefined | null,
  permissions: readonly string[],
): boolean {
  return permissions.every((permission) =>
    hasPermission(authorities, permission),
  )
}

/**
 * True when the account owns the given role. Accepts `ADMIN` and `ROLE_ADMIN`
 * alike, because the profile endpoint returns the raw role name while the
 * authorities endpoint returns the prefixed form.
 */
export function hasRole(
  authorities: readonly string[] | undefined | null,
  role: string,
): boolean {
  if (!authorities || authorities.length === 0) {
    return false
  }
  const target = normalizeAuthority(role).replace(/^ROLE_/, '')
  return authorities.some((authority) => {
    const normalized = normalizeAuthority(authority)
    if (!normalized.startsWith('ROLE_')) {
      return false
    }
    return normalized.slice('ROLE_'.length) === target
  })
}

/** Splits the authorities into the role entries and the permission entries. */
export function splitAuthorities(authorities: readonly string[] | undefined | null): {
  roles: string[]
  permissions: string[]
} {
  const roles: string[] = []
  const permissions: string[] = []

  for (const authority of authorities ?? []) {
    const normalized = normalizeAuthority(authority)
    if (normalized.startsWith('ROLE_')) {
      roles.push(normalized.slice('ROLE_'.length))
    } else {
      permissions.push(normalized)
    }
  }

  return { roles, permissions }
}
