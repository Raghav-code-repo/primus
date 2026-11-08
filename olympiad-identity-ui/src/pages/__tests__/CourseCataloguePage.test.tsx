import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { studentClient } from '../../api/client'
import {
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
  mock = createStudentServiceMock({ courses: [PUBLISHED_COURSE], ...overrides })
  studentClient.defaults.adapter = studentServiceAdapter(mock)
}

describe('CourseCataloguePage', () => {
  beforeEach(() => {
    seedSession()
    installMock()
  })

  afterEach(() => {
    studentClient.defaults.adapter = originalAdapter
    vi.restoreAllMocks()
  })

  it('lists the published courses of the catalogue', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: '/courses' })

    expect(
      await screen.findByRole('heading', { name: /published courses/i }),
    ).toBeInTheDocument()

    expect(await screen.findByText(PUBLISHED_COURSE.title)).toBeInTheDocument()
    expect(screen.getByText(PUBLISHED_COURSE.code)).toBeInTheDocument()
    expect(screen.getByText(PUBLISHED_COURSE.subject)).toBeInTheDocument()
    expect(screen.getByText(PUBLISHED_COURSE.gradeLevel)).toBeInTheDocument()
  })

  it('reads the catalogue without a status filter so the backend decides', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: '/courses' })

    await screen.findByText(PUBLISHED_COURSE.title)

    const catalogue = mock.requests.find(
      (request) => request.method === 'GET' && request.url === '/api/courses',
    )
    expect(catalogue).toBeDefined()
  })

  it('does not offer an enrollment for a course that is not published', async () => {
    installMock({ courses: [PUBLISHED_COURSE, DRAFT_COURSE] })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/courses' })

    await screen.findByText(DRAFT_COURSE.title)

    const draftCard = screen
      .getByText(DRAFT_COURSE.title)
      .closest('article') as HTMLElement
    expect(draftCard.textContent).not.toMatch(/enroll/i)

    const publishedCard = screen
      .getByText(PUBLISHED_COURSE.title)
      .closest('article') as HTMLElement
    expect(publishedCard.textContent).toMatch(/enroll/i)
  })

  it('shows the empty state when the catalogue is empty', async () => {
    installMock({ courses: [] })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/courses' })

    expect(
      await screen.findByText(/no course matches the current filter/i),
    ).toBeInTheDocument()
  })

  it('shows the error state when the student service cannot be reached', async () => {
    installMock({
      failures: {
        'GET /api/courses': {
          status: 502,
          data: { message: 'The Course Service rejected the request: 403' },
        },
      },
    })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/courses' })

    expect(
      await screen.findByText(/the course catalogue could not be loaded/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/the course service rejected the request/i),
    ).toBeInTheDocument()
  })

  it('filters the catalogue by the subject of the backend', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: '/courses' })

    await screen.findByText(PUBLISHED_COURSE.title)

    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/^subject$/i), 'Mathematics')
    await user.click(screen.getByRole('button', { name: /apply filter/i }))

    await waitFor(() => {
      expect(
        mock.requests.filter(
          (request) =>
            request.method === 'GET' && request.url === '/api/courses',
        ).length,
      ).toBeGreaterThan(1)
    })
  })

  it('does not show the enroll action for an account without the student role', async () => {
    const api = createFakeAuthApi({
      me: vi.fn(async () => ({
        id: 'teacher-1',
        email: 'teacher@example.com',
        firstName: 'Alan',
        lastName: 'Turing',
        roles: ['TEACHER'],
      })),
    })
    renderApp({ api, route: '/courses' })

    await screen.findByText(PUBLISHED_COURSE.title)

    expect(screen.queryByRole('button', { name: /^enroll$/i })).toBeNull()
  })
})
