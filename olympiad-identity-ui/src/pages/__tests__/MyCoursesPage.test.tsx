import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { studentClient } from '../../api/client'
import {
  ACTIVE_ENROLLMENT,
  CANCELLED_ENROLLMENT,
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
    courses: [PUBLISHED_COURSE],
    enrollments: [],
    ...overrides,
  })
  studentClient.defaults.adapter = studentServiceAdapter(mock)
}

describe('MyCoursesPage', () => {
  beforeEach(() => {
    seedSession()
    installMock()
  })

  afterEach(() => {
    studentClient.defaults.adapter = originalAdapter
    vi.restoreAllMocks()
  })

  it('shows the enrollments of the signed-in student', async () => {
    installMock({
      courses: [PUBLISHED_COURSE],
      enrollments: [ACTIVE_ENROLLMENT],
    })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/courses' })

    expect(
      await screen.findByRole('heading', { name: /your enrollments/i }),
    ).toBeInTheDocument()

    expect(
      await screen.findByRole('link', { name: PUBLISHED_COURSE.title }),
    ).toBeInTheDocument()
    expect(screen.getByText(PUBLISHED_COURSE.code)).toBeInTheDocument()
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
  })

  it('reads only the enrollments of the signed-in student', async () => {
    installMock({ enrollments: [ACTIVE_ENROLLMENT] })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/courses' })

    await screen.findByRole('link', { name: PUBLISHED_COURSE.title })

    const requests = mock.requests.filter(
      (request) => request.url === '/api/enrollments/me',
    )
    expect(requests).toHaveLength(1)
    expect(requests[0]!.method).toBe('GET')
    expect(requests[0]!.body).toBeUndefined()
  })

  it('resolves the course titles with a single catalogue request', async () => {
    installMock({ enrollments: [ACTIVE_ENROLLMENT] })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/courses' })

    await screen.findByRole('link', { name: PUBLISHED_COURSE.title })

    const catalogueRequests = mock.requests.filter(
      (request) => request.method === 'GET' && request.url === '/api/courses',
    )
    expect(catalogueRequests).toHaveLength(1)
  })

  it('separates the cancelled enrollments', async () => {
    installMock({
      courses: [PUBLISHED_COURSE, DRAFT_COURSE],
      enrollments: [ACTIVE_ENROLLMENT, CANCELLED_ENROLLMENT],
    })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/courses' })

    expect(
      await screen.findByRole('heading', {
        name: /active enrollments \(1\)/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /cancelled enrollments \(1\)/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('CANCELLED')).toBeInTheDocument()
  })

  it('shows the empty state with a link to the catalogue', async () => {
    installMock({ enrollments: [] })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/courses' })

    expect(
      await screen.findByText(/you are not enrolled in any course yet/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /open the course catalogue/i }),
    ).toHaveAttribute('href', '/courses')
  })

  it('cancels an enrollment', async () => {
    installMock({
      courses: [PUBLISHED_COURSE],
      enrollments: [ACTIVE_ENROLLMENT],
    })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/courses' })

    await screen.findByRole('link', { name: PUBLISHED_COURSE.title })

    const user = userEvent.setup()
    await user.click(
      screen.getByRole('button', { name: /cancel enrollment/i }),
    )

    await waitFor(() => {
      expect(
        mock.requests.some(
          (request) =>
            request.method === 'DELETE' &&
            request.url === `/api/enrollments/${ACTIVE_ENROLLMENT.id}`,
        ),
      ).toBe(true)
    })

    expect(await screen.findByText('CANCELLED')).toBeInTheDocument()
  })

  it('reports an error of the student service', async () => {
    installMock({
      failures: {
        'GET /api/enrollments/me': {
          status: 503,
          data: { message: 'The Student Service is currently unavailable.' },
        },
      },
    })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/courses' })

    expect(
      await screen.findByText(/your enrollments could not be loaded/i),
    ).toBeInTheDocument()
  })

  it('does not show the enrollments of a previous account', async () => {
    installMock({
      courses: [PUBLISHED_COURSE],
      enrollments: [ACTIVE_ENROLLMENT],
    })
    const api = createFakeAuthApi()
    const first = renderApp({ api, route: '/student/courses' })

    await screen.findByRole('link', { name: PUBLISHED_COURSE.title })

    // A second account signs in on a fresh render: the list is read again
    // from the endpoint of the new session, the old response is not reused.
    first.unmount()
    installMock({ courses: [], enrollments: [] })
    const secondApi = createFakeAuthApi({
      me: vi.fn(async () => ({
        id: '99999999-9999-9999-9999-999999999999',
        email: 'other@example.com',
        firstName: 'Other',
        lastName: 'Learner',
        roles: ['STUDENT'],
      })),
    })
    renderApp({ api: secondApi, route: '/student/courses' })

    expect(
      await screen.findByText(/you are not enrolled in any course yet/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: PUBLISHED_COURSE.title }),
    ).toBeNull()
  })
})
