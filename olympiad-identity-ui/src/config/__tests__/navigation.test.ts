import { describe, expect, it } from 'vitest'

import {
  buildNavigation,
  dashboardRouteForRoles,
} from '../navigation'
import {
  PERMISSION_COURSE_CREATE,
  PERMISSION_COURSE_READ,
} from '../../auth/permissions'

function labels(roles: string[], authorities: string[] = []): string[] {
  return buildNavigation({
    roles,
    hasPermission: (permission) => authorities.includes(permission),
  }).map((item) => item.label)
}

describe('the navigation of the academy', () => {
  it('shows the student features for a student', () => {
    expect(labels(['STUDENT'])).toEqual([
      'Dashboard',
      'My Profile',
      'Course Catalogue',
      'My Courses',
      'Account',
    ])
  })

  it('does not show the student features for a teacher', () => {
    const items = labels(['TEACHER'])

    expect(items).not.toContain('My Profile')
    expect(items).not.toContain('My Courses')
    expect(items).toContain('Course Catalogue')
    expect(items).toContain('Account')
  })

  it('shows the administration for an administrator', () => {
    expect(labels(['ADMIN'])).toContain('Administration')
    expect(labels(['STUDENT'])).not.toContain('Administration')
  })

  it('shows the course management only with a course permission', () => {
    expect(labels(['TEACHER'], [PERMISSION_COURSE_READ])).toContain(
      'Course Management',
    )
    expect(labels(['TEACHER'], [PERMISSION_COURSE_CREATE])).toContain(
      'Course Management',
    )
    expect(labels(['TEACHER'])).not.toContain('Course Management')
  })

  it('never shows the student features for a parent account', () => {
    const items = labels(['PARENT'])

    expect(items).not.toContain('My Profile')
    expect(items).not.toContain('My Courses')
  })

  it('resolves the dashboard of the roles of the account', () => {
    expect(dashboardRouteForRoles(['STUDENT'])).toBe('/student/dashboard')
    expect(dashboardRouteForRoles(['TEACHER'])).toBe('/faculty/dashboard')
    expect(dashboardRouteForRoles(['ADMIN'])).toBe('/admin/dashboard')
    expect(dashboardRouteForRoles(['PARENT'])).toBe('/parent/dashboard')
    expect(dashboardRouteForRoles([])).toBeNull()
  })

  it('prefers the most privileged dashboard when several roles are held', () => {
    expect(dashboardRouteForRoles(['STUDENT', 'ADMIN'])).toBe(
      '/admin/dashboard',
    )
    expect(dashboardRouteForRoles(['STUDENT', 'TEACHER'])).toBe(
      '/faculty/dashboard',
    )
  })
})
