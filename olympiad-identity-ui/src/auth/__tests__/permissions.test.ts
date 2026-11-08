import { describe, expect, it } from 'vitest'

import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  hasRole,
  splitAuthorities,
} from '../permissions'

const AUTHORITIES = [
  'COURSE_CREATE',
  'COURSE_DELETE',
  'COURSE_READ',
  'COURSE_UPDATE',
  'ROLE_COURSE_MANAGER',
  'ROLE_STUDENT',
]

describe('permission helpers', () => {
  it('detects a permission the account owns', () => {
    expect(hasPermission(AUTHORITIES, 'COURSE_READ')).toBe(true)
    expect(hasPermission(AUTHORITIES, 'COURSE_DELETE')).toBe(true)
  })

  it('does not treat a role as a permission', () => {
    expect(hasPermission(AUTHORITIES, 'ROLE_ADMIN')).toBe(false)
    expect(hasPermission(AUTHORITIES, 'ADMIN')).toBe(false)
  })

  it('reports a missing permission', () => {
    expect(hasPermission(['ROLE_STUDENT'], 'COURSE_CREATE')).toBe(false)
    expect(hasPermission([], 'COURSE_READ')).toBe(false)
    expect(hasPermission(null, 'COURSE_READ')).toBe(false)
    expect(hasPermission(undefined, 'COURSE_READ')).toBe(false)
  })

  it('matches a permission regardless of the letter case', () => {
    expect(hasPermission(['course_read'], 'COURSE_READ')).toBe(true)
  })

  it('checks any and all permissions', () => {
    expect(hasAnyPermission(AUTHORITIES, ['COURSE_DELETE', 'NOPE'])).toBe(true)
    expect(hasAnyPermission(AUTHORITIES, ['NOPE'])).toBe(false)
    expect(
      hasAllPermissions(AUTHORITIES, ['COURSE_READ', 'COURSE_CREATE']),
    ).toBe(true)
    expect(hasAllPermissions(AUTHORITIES, ['COURSE_READ', 'NOPE'])).toBe(false)
  })

  it('detects a role with and without the ROLE_ prefix', () => {
    expect(hasRole(AUTHORITIES, 'COURSE_MANAGER')).toBe(true)
    expect(hasRole(AUTHORITIES, 'ROLE_COURSE_MANAGER')).toBe(true)
    expect(hasRole(AUTHORITIES, 'ADMIN')).toBe(false)
  })

  it('never reports a permission as a role', () => {
    expect(hasRole(['COURSE_READ'], 'COURSE_READ')).toBe(false)
  })

  it('splits roles and permissions', () => {
    const split = splitAuthorities(AUTHORITIES)
    expect(split.roles).toEqual(['COURSE_MANAGER', 'STUDENT'])
    expect(split.permissions).toEqual([
      'COURSE_CREATE',
      'COURSE_DELETE',
      'COURSE_READ',
      'COURSE_UPDATE',
    ])
  })
})
