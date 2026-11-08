import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

import {
  ADMIN_PROFILE,
  createFakeAuthApi,
  PLAIN_STUDENT_AUTHORITIES,
  renderApp,
  seedSession,
  TEACHER_PROFILE,
  TEST_PROFILE,
} from '../../test/utils'
import type { AuthUserProfile } from '../../types/auth'

function profileWith(roles: string[]): AuthUserProfile {
  return { ...TEST_PROFILE, roles }
}

describe('Navbar role aware navigation', () => {
  it('shows the administration entry for the ADMIN role', async () => {
    seedSession()
    const api = createFakeAuthApi({
      me: vi.fn(async () => ADMIN_PROFILE),
    })
    renderApp({ api, route: '/dashboard' })

    expect(
      await screen.findByRole('link', { name: 'Administration' }),
    ).toBeInTheDocument()
    expect((await screen.findAllByText('ADMIN')).length).toBeGreaterThan(0)
  })

  it('hides the administration entry for the STUDENT role', async () => {
    seedSession()
    const api = createFakeAuthApi({
      me: vi.fn(async () => profileWith(['STUDENT'])),
    })
    renderApp({ api, route: '/dashboard' })

    expect(
      await screen.findByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Administration' }),
    ).not.toBeInTheDocument()
    expect((await screen.findAllByText('STUDENT')).length).toBeGreaterThan(0)
  })

  it('hides the administration entry for the TEACHER role', async () => {
    seedSession()
    const api = createFakeAuthApi({
      me: vi.fn(async () => profileWith(['TEACHER'])),
    })
    renderApp({ api, route: '/dashboard' })

    expect(
      await screen.findByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Administration' }),
    ).not.toBeInTheDocument()
    expect((await screen.findAllByText('TEACHER')).length).toBeGreaterThan(0)
  })

  it('shows the student features for a student account', async () => {
    seedSession()
    const api = createFakeAuthApi({
      me: vi.fn(async () => profileWith(['STUDENT'])),
      permissions: vi.fn(async () => PLAIN_STUDENT_AUTHORITIES),
    })
    renderApp({ api, route: '/dashboard' })

    expect(
      await screen.findByRole('link', { name: 'My Profile' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Course Catalogue' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'My Courses' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Course Management' }),
    ).not.toBeInTheDocument()
  })

  it('hides the course management without a course permission', async () => {
    seedSession()
    const api = createFakeAuthApi({
      me: vi.fn(async () => profileWith(['STUDENT'])),
      permissions: vi.fn(async () => PLAIN_STUDENT_AUTHORITIES),
    })
    renderApp({ api, route: '/dashboard' })

    await screen.findByRole('link', { name: 'My Courses' })
    expect(
      screen.queryByRole('link', { name: 'Course Management' }),
    ).not.toBeInTheDocument()
  })

  it('shows the course management for an account with a course permission', async () => {
    seedSession()
    const api = createFakeAuthApi({
      me: vi.fn(async () => TEACHER_PROFILE),
      permissions: vi.fn(async () => ({
        subject: TEACHER_PROFILE.email,
        authorities: ['COURSE_READ', 'ROLE_TEACHER'],
      })),
    })
    renderApp({ api, route: '/dashboard' })

    expect(
      await screen.findByRole('link', { name: 'Course Management' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Administration' }),
    ).not.toBeInTheDocument()
  })

  it('always shows the dashboard and the account entries', async () => {
    seedSession()
    const api = createFakeAuthApi()
    renderApp({ api, route: '/dashboard' })

    await screen.findByRole('heading', { name: /welcome back/i })
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Account' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /log out/i }),
    ).toBeInTheDocument()
  })
})
