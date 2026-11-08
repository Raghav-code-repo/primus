import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { studentClient } from '../../api/client'
import {
  ADMIN_PROFILE,
  createFakeAuthApi,
  DRAFT_COURSE,
  PLAIN_STUDENT_AUTHORITIES,
  PUBLISHED_COURSE,
  renderApp,
  seedSession,
  STUDENT_PROFILE,
  TEACHER_PROFILE,
} from '../../test/utils'
import {
  createStudentServiceMock,
  studentServiceAdapter,
  type StudentServiceMock,
} from '../../test/studentServiceMock'

const originalAdapter = studentClient.defaults.adapter

let mock: StudentServiceMock

describe('the role based dashboards', () => {
  beforeEach(() => {
    seedSession()
    mock = createStudentServiceMock({
      profile: STUDENT_PROFILE,
      courses: [PUBLISHED_COURSE, DRAFT_COURSE],
      enrollments: [],
    })
    studentClient.defaults.adapter = studentServiceAdapter(mock)
  })

  afterEach(() => {
    studentClient.defaults.adapter = originalAdapter
    vi.restoreAllMocks()
  })

  it('opens the student dashboard for a student', async () => {
    const api = createFakeAuthApi({
      permissions: vi.fn(async () => PLAIN_STUDENT_AUTHORITIES),
    })
    renderApp({ api, route: '/dashboard' })

    expect(
      await screen.findByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/student dashboard/i)).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: /my courses/i })[0],
    ).toHaveAttribute('href', '/student/courses')
  })

  it('shows the profile summary of the student', async () => {
    const api = createFakeAuthApi({
      permissions: vi.fn(async () => PLAIN_STUDENT_AUTHORITIES),
    })
    renderApp({ api, route: '/dashboard' })

    expect(await screen.findByText(STUDENT_PROFILE.grade!)).toBeInTheDocument()
  })

  it('opens the faculty dashboard for a teacher', async () => {
    const api = createFakeAuthApi({
      me: vi.fn(async () => TEACHER_PROFILE),
    })
    renderApp({ api, route: '/dashboard' })

    expect(
      await screen.findByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/faculty dashboard/i)).toBeInTheDocument()
  })

  it('does not invent teaching data for a teacher', async () => {
    const api = createFakeAuthApi({
      me: vi.fn(async () => TEACHER_PROFILE),
    })
    renderApp({ api, route: '/dashboard' })

    expect(
      await screen.findByRole('heading', { name: /teaching features/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/not available yet/i)).toBeInTheDocument()
    expect(
      screen.queryByText(/linked students/i),
    ).not.toBeInTheDocument()
  })

  it('opens the admin dashboard for an administrator', async () => {
    const api = createFakeAuthApi({
      me: vi.fn(async () => ADMIN_PROFILE),
    })
    renderApp({ api, route: '/dashboard' })

    expect(
      await screen.findByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: /administration/i })[0],
    ).toHaveAttribute('href', '/admin')
  })

  it('reports that the number of users is not available without USER_READ', async () => {
    const api = createFakeAuthApi({
      me: vi.fn(async () => ADMIN_PROFILE),
      permissions: vi.fn(async () => ({
        subject: ADMIN_PROFILE.email,
        authorities: ['ROLE_ADMIN'],
      })),
    })
    renderApp({ api, route: '/dashboard' })

    expect(
      (await screen.findAllByText(/not available/i)).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByText(/the number of users is not available/i),
    ).toBeInTheDocument()
  })

  it('shows the parent dashboard as not available', async () => {
    const api = createFakeAuthApi({
      me: vi.fn(async () => ({
        id: 'parent-1',
        email: 'parent@example.com',
        firstName: 'Pat',
        lastName: 'Parent',
        roles: ['PARENT'],
      })),
    })
    renderApp({ api, route: '/parent/dashboard' })

    expect(
      await screen.findByRole('heading', { name: /linked students/i }),
    ).toBeInTheDocument()
    expect(screen.getAllByText(/not available/i).length).toBeGreaterThan(0)
    expect(
      screen.queryByText(/parent of/i),
    ).not.toBeInTheDocument()
  })
})
