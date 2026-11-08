import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ApiError } from '../../api/errors'
import { getAccessToken } from '../../auth/tokenStorage'
import {
  COURSE_MANAGER_AUTHORITIES,
  createFakeAuthApi,
  renderApp,
  seedSession,
  STUDENT_AUTHORITIES,
  TEST_TOKEN,
} from '../../test/utils'

describe('authorities of the signed-in account', () => {
  it('loads the authorities from the identity service after a page reload', async () => {
    seedSession()
    const api = createFakeAuthApi()
    renderApp({ api, route: '/profile' })

    await screen.findByRole('heading', { name: /your account/i })

    await waitFor(() => {
      expect(api.permissions).toHaveBeenCalledTimes(1)
    })
    expect(screen.getByText('COURSE_READ')).toBeInTheDocument()
    expect(screen.getByText('ROLE_STUDENT')).toBeInTheDocument()
  })

  it('loads the authorities after a successful login', async () => {
    const api = createFakeAuthApi()
    renderApp({ api, route: '/login' })

    const user = userEvent.setup()

    await user.type(
      screen.getByLabelText(/^email address$/i),
      'learner@example.com',
    )
    await user.type(screen.getByLabelText(/^password$/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    await screen.findByRole('heading', { name: /welcome back/i })
    expect(api.permissions).toHaveBeenCalledTimes(1)
  })

  it('reports the permissions of the account in the profile', async () => {
    seedSession()
    const api = createFakeAuthApi({
      permissions: vi.fn(async () => COURSE_MANAGER_AUTHORITIES),
    })
    renderApp({ api, route: '/profile' })

    await screen.findByRole('heading', { name: /your account/i })

    expect(screen.getByText('COURSE_CREATE')).toBeInTheDocument()
    expect(screen.getByText('COURSE_DELETE')).toBeInTheDocument()
    expect(screen.getByText('COURSE_UPDATE')).toBeInTheDocument()
  })

  it('keeps the session when the authorities cannot be loaded', async () => {
    seedSession()
    const api = createFakeAuthApi({
      permissions: vi.fn(async () => {
        throw new ApiError({
          status: 503,
          message: 'The Identity Service is currently unavailable.',
        })
      }),
    })
    renderApp({ api, route: '/profile' })

    await screen.findByRole('heading', { name: /your account/i })

    expect(getAccessToken()).toBe(TEST_TOKEN)
    expect(
      await screen.findByText(/authorities unavailable/i),
    ).toBeInTheDocument()
  })

  it('clears the session when the identity service rejects the token while loading the authorities', async () => {
    seedSession()
    const api = createFakeAuthApi({
      permissions: vi.fn(async () => {
        throw new ApiError({
          status: 401,
          message: 'Invalid or expired token',
          code: 'UNAUTHORIZED',
        })
      }),
    })
    renderApp({ api, route: '/dashboard' })

    // A rejected token must never flash a protected page: the visitor stays
    // on the login page and the session is cleared.
    expect(
      await screen.findByRole('heading', { name: /sign in/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /welcome back/i }),
    ).not.toBeInTheDocument()
    await waitFor(() => {
      expect(getAccessToken()).toBeNull()
    })
  })

  it('exposes the student authorities of the fake identity service', () => {
    expect(STUDENT_AUTHORITIES.authorities).toContain('COURSE_READ')
    expect(STUDENT_AUTHORITIES.authorities).not.toContain('COURSE_CREATE')
  })
})
