import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { studentClient } from '../../api/client'
import {
  createFakeAuthApi,
  renderApp,
  seedSession,
  STUDENT_PROFILE,
} from '../../test/utils'
import {
  createStudentServiceMock,
  studentServiceAdapter,
  type StudentServiceMock,
} from '../../test/studentServiceMock'

const originalAdapter = studentClient.defaults.adapter

let mock: StudentServiceMock

function installMock(overrides: Partial<StudentServiceMock> = {}) {
  mock = createStudentServiceMock({ profile: STUDENT_PROFILE, ...overrides })
  studentClient.defaults.adapter = studentServiceAdapter(mock)
}

describe('StudentProfilePage', () => {
  beforeEach(() => {
    seedSession()
    installMock()
  })

  afterEach(() => {
    studentClient.defaults.adapter = originalAdapter
    vi.restoreAllMocks()
  })

  it('loads the profile of the signed-in student', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/profile' })

    expect(
      await screen.findByRole('heading', { name: /your student profile/i }),
    ).toBeInTheDocument()

    // The ready state renders the edit action, so waiting for it means the
    // profile has been loaded.
    await screen.findByRole('button', { name: /edit profile/i })

    expect(screen.getAllByText(STUDENT_PROFILE.fullName!).length).toBeGreaterThan(0)
    expect(screen.getByText(STUDENT_PROFILE.grade!)).toBeInTheDocument()
    expect(screen.getByText(STUDENT_PROFILE.schoolName!)).toBeInTheDocument()
    expect(screen.getByText(STUDENT_PROFILE.phone!)).toBeInTheDocument()
  })

  it('reads the profile from the /me endpoint of the student service', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/profile' })

    await screen.findByRole('button', { name: /edit profile/i })

    expect(mock.requests).toContainEqual({
      method: 'GET',
      url: '/api/students/me',
      body: undefined,
    })
  })

  it('updates the profile and shows the success message', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/profile' })

    await screen.findByRole('button', { name: /edit profile/i })

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /edit profile/i }))

    const grade = await screen.findByLabelText(/^grade$/i)
    await user.clear(grade)
    await user.type(grade, 'Grade 7')

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(
      await screen.findByText(/profile saved/i),
    ).toBeInTheDocument()

    const update = mock.requests.find(
      (request) => request.method === 'PUT',
    )
    expect(update?.url).toBe('/api/students/me')
    expect(update?.body).toMatchObject({ grade: 'Grade 7' })
  })

  it('never sends the identity or the protected fields of the profile', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/profile' })

    await screen.findByRole('button', { name: /edit profile/i })

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /edit profile/i }))
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await screen.findByText(/profile saved/i)

    const update = mock.requests.find(
      (request) => request.method === 'PUT',
    )
    expect(Object.keys(update?.body as object).sort()).toEqual([
      'fullName',
      'grade',
      'phone',
      'schoolName',
    ])
  })

  it('offers the creation flow when no profile exists', async () => {
    installMock({ profile: null })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/profile' })

    expect(
      await screen.findByText(/no student profile yet/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create your profile/i }),
    ).toBeInTheDocument()
  })

  it('creates the profile of the signed-in student', async () => {
    installMock({ profile: null })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/profile' })

    await screen.findByText(/no student profile yet/i)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /create your profile/i }))

    await user.type(await screen.findByLabelText(/^full name$/i), 'Ada Lovelace')
    await user.click(
      screen.getByRole('button', { name: /create profile/i }),
    )

    expect(await screen.findByText(/profile saved/i)).toBeInTheDocument()

    const create = mock.requests.find(
      (request) => request.method === 'POST',
    )
    expect(create?.url).toBe('/api/students/me')
    expect(create?.body).toMatchObject({ fullName: 'Ada Lovelace' })
  })

  it('reports an error of the student service', async () => {
    installMock({
      failures: {
        'GET /api/students/me': {
          status: 503,
          data: { message: 'The Student Service is currently unavailable.' },
        },
      },
    })
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/profile' })

    expect(
      await screen.findByText(/the profile could not be loaded/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /try again/i }),
    ).toBeInTheDocument()
  })

  it('validates the form before it sends a request', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/profile' })

    await screen.findByRole('button', { name: /edit profile/i })

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /edit profile/i }))

    const fullName = await screen.findByLabelText(/^full name$/i)
    await user.clear(fullName)
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument()
    expect(
      mock.requests.some((request) => request.method === 'PUT'),
    ).toBe(false)
  })

  it('rejects an account without the student role', async () => {
    const api = createFakeAuthApi({
      me: vi.fn(async () => ({
        ...STUDENT_PROFILE,
        id: 'x',
        email: 'teacher@example.com',
        firstName: 'Alan',
        lastName: 'Turing',
        roles: ['TEACHER'],
      })),
    })
    renderApp({ api, route: '/student/profile' })

    expect(
      await screen.findByRole('heading', { name: /access denied/i }),
    ).toBeInTheDocument()
  })

  it('does not request the profile of another student', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: '/student/profile' })

    await screen.findByRole('button', { name: /edit profile/i })

    await waitFor(() => {
      expect(
        mock.requests.every((request) => !request.url.includes('identity')),
      ).toBe(true)
    })
  })
})
