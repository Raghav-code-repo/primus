import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { studentClient } from '../../api/client'
import {
  ACTIVE_ENROLLMENT,
  createFakeAuthApi,
  DRAFT_COURSE,
  PUBLISHED_COURSE,
  renderApp,
  seedSession,
} from '../../test/utils'
import {
  createStudentServiceMock,
  studentServiceAdapter,
  type StudentServiceMock,
} from '../../test/studentServiceMock'

const originalAdapter = studentClient.defaults.adapter

let mock: StudentServiceMock

function installMock(overrides: Partial<StudentServiceMock> = {}) {
  mock = createStudentServiceMock({
    courses: [PUBLISHED_COURSE, DRAFT_COURSE],
    enrollments: [],
    ...overrides,
  })
  studentClient.defaults.adapter = studentServiceAdapter(mock)
}

describe('enrollment', () => {
  beforeEach(() => {
    seedSession()
    installMock()
  })

  afterEach(() => {
    studentClient.defaults.adapter = originalAdapter
    vi.restoreAllMocks()
  })

  it('enrolls the signed-in student and updates the interface', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: '/courses' })

    await screen.findByText(PUBLISHED_COURSE.title)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /^enroll$/i }))

    await waitFor(() => {
      expect(
        mock.requests.some(
          (request) =>
            request.method === 'POST' && request.url === '/api/enrollments',
        ),
      ).toBe(true)
    })

    const create = mock.requests.find(
      (request) => request.method === 'POST',
    )
    expect(create?.body).toEqual({ courseId: PUBLISHED_COURSE.id })

    // The card shows the new state of the enrollment.
    expect(await screen.findByText(/^enrolled$/i)).toBeInTheDocument()
  })

  it('does not send the identity of the student with the request', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: '/courses' })

    await screen.findByText(PUBLISHED_COURSE.title)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /^enroll$/i }))

    await waitFor(() => {
      expect(
        mock.requests.some((request) => request.method === 'POST'),
      ).toBe(true)
    })

    const create = mock.requests.find((request) => request.method === 'POST')
    expect(Object.keys(create?.body as object)).toEqual(['courseId'])
  })

  it('reports a duplicate enrollment without a false success message', async () => {
    installMock({ enrollments: [ACTIVE_ENROLLMENT] })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/courses' })

    await screen.findByText(PUBLISHED_COURSE.title)

    // The card already shows the enrollment, so the request is triggered from
    // the detail page where the button is always available.
    const user = userEvent.setup()
    await user.click(screen.getByRole('link', { name: PUBLISHED_COURSE.title }))

    await screen.findByRole('heading', { name: PUBLISHED_COURSE.title })

    expect(await screen.findByText(/you are enrolled/i)).toBeInTheDocument()
  })

  it('shows the message of the backend for HTTP 409', async () => {
    installMock({
      failures: {
        'POST /api/enrollments': {
          status: 409,
          data: {
            timestamp: '2026-10-22T09:00:00Z',
            status: 409,
            message: 'The student is already enrolled in this course',
          },
        },
      },
    })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/courses' })

    await screen.findByText(PUBLISHED_COURSE.title)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /^enroll$/i }))

    expect(
      await screen.findByText(/already enrolled in this course/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/profile saved|enrollment created/i),
    ).toBeNull()
  })

  it('shows the message of the backend for HTTP 422', async () => {
    installMock({
      failures: {
        'POST /api/enrollments': {
          status: 422,
          data: {
            timestamp: '2026-10-22T09:00:00Z',
            status: 422,
            message: 'Course is not open for enrollment (status: DRAFT)',
          },
        },
      },
    })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/courses' })

    await screen.findByText(PUBLISHED_COURSE.title)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /^enroll$/i }))

    expect(
      await screen.findByText(/not currently open for enrollment/i),
    ).toBeInTheDocument()
  })

  it('reports a failed request instead of a false success', async () => {
    installMock({
      failures: {
        'POST /api/enrollments': {
          status: 503,
          data: { message: 'The Student Service is currently unavailable.' },
        },
      },
    })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/courses' })

    await screen.findByText(PUBLISHED_COURSE.title)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /^enroll$/i }))

    expect(
      await screen.findByText(/the student service is currently unavailable/i),
    ).toBeInTheDocument()
    expect(screen.queryByText(/^enrolled$/i)).toBeNull()
  })

  it('does not offer an enrollment for a draft course on the detail page', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: `/courses/${DRAFT_COURSE.id}` })

    expect(
      await screen.findByRole('heading', { name: DRAFT_COURSE.title }),
    ).toBeInTheDocument()

    expect(
      await screen.findByText(/not open for enrollment/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^enroll$/i }),
    ).toBeNull()
  })

  it('reports a missing course', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: '/courses/does-not-exist' })

    expect(
      await screen.findByText(/the course could not be loaded/i),
    ).toBeInTheDocument()
  })

  it('prevents a double submission', async () => {
    let enrollmentRequestStarted = false
    installMock()
    studentClient.defaults.adapter = (config) => {
      const method = (config.method ?? 'get').toUpperCase()
      const url = (config.url ?? '').split('?')[0]
      if (method === 'POST' && url === '/api/enrollments') {
        enrollmentRequestStarted = true
        return new Promise((_resolve, reject) => {
          setTimeout(() => {
            reject(
              Object.assign(new Error('aborted'), { isAxiosError: true, config }),
            )
          }, 50)
        })
      }
      return studentServiceAdapter(mock)(config)
    }

    const api = createFakeAuthApi()
    renderApp({ api, route: '/courses' })

    await screen.findByText(PUBLISHED_COURSE.title)

    const user = userEvent.setup()
    const button = screen.getByRole('button', { name: /^enroll$/i })
    await user.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
    })

    expect(enrollmentRequestStarted).toBe(true)
  })
})
