import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AxiosAdapter, AxiosResponse } from 'axios'

import { courseClient } from '../../api/client'
import { ApiError } from '../../api/errors'
import {
  COURSE_MANAGER_AUTHORITIES,
  createFakeAuthApi,
  renderApp,
  seedSession,
  STUDENT_AUTHORITIES,
} from '../../test/utils'
import type { Course } from '../../types/course'

const originalAdapter = courseClient.defaults.adapter

const MATH_COURSE: Course = {
  id: 'c7e8950e-2801-43d5-b4af-38a9f166cc1a',
  code: 'MATH-OLY-001',
  title: 'Mathematics Olympiad Foundation',
  description: 'Foundational mathematics.',
  subject: 'Mathematics',
  gradeLevel: 'Grade 6',
  status: 'DRAFT',
  createdAt: '2026-10-21T08:51:22.670375Z',
  updatedAt: '2026-10-21T08:51:22.670375Z',
}

function pageAdapter(courses: Course[] = [MATH_COURSE]): AxiosAdapter {
  return async (config) =>
    ({
      data: {
        content: courses,
        totalElements: courses.length,
        totalPages: 1,
        number: 0,
        size: 10,
        numberOfElements: courses.length,
        first: true,
        last: true,
        empty: courses.length === 0,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }) as AxiosResponse
}

describe('CourseManagementPage', () => {
  beforeEach(() => {
    seedSession()
    courseClient.defaults.adapter = pageAdapter()
  })

  afterEach(() => {
    courseClient.defaults.adapter = originalAdapter
    vi.restoreAllMocks()
  })

  it('lists the courses returned by the course service', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: '/admin/courses' })

    expect(
      await screen.findByRole('heading', { name: /^courses$/i }),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('MATH-OLY-001'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Mathematics Olympiad Foundation'),
    ).toBeInTheDocument()
  })

  it('shows the empty state when the course service returns no courses', async () => {
    courseClient.defaults.adapter = pageAdapter([])
    const api = createFakeAuthApi()
    renderApp({ api, route: '/admin/courses' })

    expect(
      await screen.findByText(/no course matches the current filter/i),
    ).toBeInTheDocument()
  })

  it('shows the error state when the course service cannot be reached', async () => {
    courseClient.defaults.adapter = (config) =>
      Promise.reject(
        Object.assign(new Error('boom'), {
          isAxiosError: true,
          config,
          response: { status: 500, data: {}, headers: {}, statusText: '', config },
        }),
      )
    const api = createFakeAuthApi()
    renderApp({ api, route: '/admin/courses' })

    expect(
      await screen.findByText(/the courses could not be loaded/i),
    ).toBeInTheDocument()
  })

  it('hides the create action for an account without COURSE_CREATE', async () => {
    const api = createFakeAuthApi({
      permissions: vi.fn(async () => STUDENT_AUTHORITIES),
    })
    renderApp({ api, route: '/admin/courses' })

    await screen.findByRole('heading', { name: /^courses$/i })

    expect(
      screen.queryByRole('link', { name: /new course/i }),
    ).not.toBeInTheDocument()
  })

  it('shows the create action for an account with COURSE_CREATE', async () => {
    const api = createFakeAuthApi({
      permissions: vi.fn(async () => COURSE_MANAGER_AUTHORITIES),
    })
    renderApp({ api, route: '/admin/courses' })

    await screen.findByRole('heading', { name: /^courses$/i })

    expect(
      screen.getByRole('link', { name: /new course/i }),
    ).toHaveAttribute('href', '/admin/courses/new')
  })

  it('hides the edit and delete actions without the matching permissions', async () => {
    const api = createFakeAuthApi({
      permissions: vi.fn(async () => STUDENT_AUTHORITIES),
    })
    renderApp({ api, route: '/admin/courses' })

    await screen.findByText('MATH-OLY-001')

    expect(screen.queryByRole('link', { name: /^edit$/i })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /^delete$/i }),
    ).not.toBeInTheDocument()
  })

  it('shows the edit and delete actions for a course manager', async () => {
    const api = createFakeAuthApi({
      permissions: vi.fn(async () => COURSE_MANAGER_AUTHORITIES),
    })
    renderApp({ api, route: '/admin/courses' })

    await screen.findByText('MATH-OLY-001')

    expect(screen.getByRole('link', { name: /^edit$/i })).toHaveAttribute(
      'href',
      `/admin/courses/${MATH_COURSE.id}/edit`,
    )
    expect(screen.getByRole('link', { name: /^delete$/i })).toBeInTheDocument()
  })

  it('redirects an account without COURSE_READ to the access denied page', async () => {
    const api = createFakeAuthApi({
      permissions: vi.fn(async () => ({
        subject: 'learner@example.com',
        authorities: ['ROLE_STUDENT'],
      })),
    })
    renderApp({ api, route: '/admin/courses' })

    expect(
      await screen.findByRole('heading', { name: /access denied/i }),
    ).toBeInTheDocument()
  })

  it('reloads the course list when the refresh button is used', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: '/admin/courses' })

    await screen.findByText('MATH-OLY-001')

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /refresh/i }))

    await waitFor(() => {
      expect(screen.getByText('MATH-OLY-001')).toBeInTheDocument()
    })
  })

  it('reports a forbidden course service response without ending the session', async () => {
    courseClient.defaults.adapter = (config) =>
      Promise.reject(
        Object.assign(new Error('forbidden'), {
          isAxiosError: true,
          config,
          response: {
            status: 403,
            data: { title: 'Access Denied', status: 403 },
            headers: {},
            statusText: '',
            config,
          },
        }),
      )
    const api = createFakeAuthApi()
    renderApp({ api, route: '/admin/courses' })

    expect(
      await screen.findByText(/the courses could not be loaded/i),
    ).toBeInTheDocument()
    expect(new ApiError({ status: 403, message: 'x' }).isForbidden).toBe(true)
  })
})
