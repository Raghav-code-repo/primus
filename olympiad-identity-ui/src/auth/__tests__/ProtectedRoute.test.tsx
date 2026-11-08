import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ApiError } from '../../api/errors'
import { getAccessToken } from '../../auth/tokenStorage'
import {
  createFakeAuthApi,
  renderApp,
  seedSession,
  TEST_PROFILE,
  TEST_TOKEN,
} from '../../test/utils'
import type { AuthUserProfile } from '../../types/auth'

describe('ProtectedRoute', () => {
  it('redirects an unauthenticated visitor to the login page', async () => {
    renderApp({ route: '/dashboard' })

    expect(
      await screen.findByRole('heading', { name: /sign in/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /welcome back/i }),
    ).not.toBeInTheDocument()
  })

  it('keeps the internal return path of the protected page', async () => {
    renderApp({ route: '/profile' })

    await screen.findByRole('heading', { name: /sign in/i })
    expect(
      screen.getByRole('button', { name: /^sign in$/i }),
    ).toBeInTheDocument()
  })

  it('opens the dashboard for an authenticated user', async () => {
    seedSession()
    const api = createFakeAuthApi()
    renderApp({ api, route: '/dashboard' })

    expect(
      await screen.findByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/student dashboard/i)).toBeInTheDocument()
    expect(
      screen.getByText(`${TEST_PROFILE.firstName} ${TEST_PROFILE.lastName}`),
    ).toBeInTheDocument()
  })

  it('does not redirect while the session is being restored', async () => {
    seedSession()
    let resolveProfile: (profile: AuthUserProfile) => void = () => {}
    const api = createFakeAuthApi({
      me: vi.fn(
        () =>
          new Promise<AuthUserProfile>((resolve) => {
            resolveProfile = resolve
          }),
      ),
    })
    renderApp({ api, route: '/dashboard' })

    expect(
      await screen.findByText(/restoring your session/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: /sign in/i }),
    ).not.toBeInTheDocument()

    resolveProfile(TEST_PROFILE)

    expect(
      await screen.findByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument()
  })

  it('sends an authenticated user away from the login page', async () => {
    seedSession()
    const api = createFakeAuthApi()
    renderApp({ api, route: '/login' })

    expect(
      await screen.findByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument()
  })

  it('clears the authentication state on logout', async () => {
    seedSession()
    const api = createFakeAuthApi()
    renderApp({ api, route: '/dashboard' })

    await screen.findByRole('heading', { name: /welcome back/i })

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /log out/i }))

    expect(
      await screen.findByRole('heading', { name: /sign in/i }),
    ).toBeInTheDocument()
    expect(getAccessToken()).toBeNull()
    expect(api.me).toHaveBeenCalledTimes(1)
  })

  it('resets the session when the backend answers 401', async () => {
    seedSession()
    const api = createFakeAuthApi({
      me: vi.fn(async () => {
        throw new ApiError({
          status: 401,
          message: 'Invalid or expired token',
          code: 'UNAUTHORIZED',
        })
      }),
    })
    renderApp({ api, route: '/dashboard' })

    expect(
      await screen.findByRole('heading', { name: /sign in/i }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(getAccessToken()).toBeNull()
    })
  })

  it('keeps a valid session when the backend reports a forbidden action', async () => {
    seedSession()
    const api = createFakeAuthApi()
    renderApp({ api, route: '/dashboard' })

    await screen.findByRole('heading', { name: /welcome back/i })
    expect(getAccessToken()).toBe(TEST_TOKEN)
  })
})
