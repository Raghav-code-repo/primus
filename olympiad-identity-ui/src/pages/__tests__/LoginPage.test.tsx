import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ApiError } from '../../api/errors'
import { getAccessToken } from '../../auth/tokenStorage'
import {
  createAuthResponse,
  createFakeAuthApi,
  renderApp,
  TEST_PROFILE,
  TEST_TOKEN,
} from '../../test/utils'
import type { AuthResponse } from '../../types/auth'

describe('LoginPage', () => {
  it('renders the sign in form', () => {
    renderApp({ route: '/login' })

    expect(
      screen.getByRole('heading', { name: /sign in/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/^email address$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^sign in$/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create one/i })).toBeInTheDocument()
  })

  it('validates the required fields before calling the backend', async () => {
    const user = userEvent.setup()
    const api = createFakeAuthApi()
    renderApp({ api, route: '/login' })

    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    expect(api.login).not.toHaveBeenCalled()
  })

  it('rejects an invalid email format', async () => {
    const user = userEvent.setup()
    const api = createFakeAuthApi()
    renderApp({ api, route: '/login' })

    await user.type(screen.getByLabelText(/^email address$/i), 'not-an-email')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    expect(
      await screen.findByText(/enter a valid email address/i),
    ).toBeInTheDocument()
    expect(api.login).not.toHaveBeenCalled()
  })

  it('stores the authentication state and opens the dashboard', async () => {
    const user = userEvent.setup()
    const api = createFakeAuthApi({
      login: vi.fn(async (): Promise<AuthResponse> => createAuthResponse()),
    })
    renderApp({ api, route: '/login' })

    await user.type(screen.getByLabelText(/^email address$/i), TEST_PROFILE.email)
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    expect(
      await screen.findByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument()
    expect(api.login).toHaveBeenCalledWith({
      email: TEST_PROFILE.email,
      password: 'password123',
    })
    await waitFor(() => {
      expect(getAccessToken()).toBe(TEST_TOKEN)
    })
  })

  it('shows a readable message for invalid credentials', async () => {
    const user = userEvent.setup()
    const api = createFakeAuthApi({
      login: vi.fn(async (): Promise<AuthResponse> => {
        throw new ApiError({
          status: 401,
          message: 'Invalid email or password',
          code: 'UNAUTHORIZED',
        })
      }),
    })
    renderApp({ api, route: '/login' })

    await user.type(screen.getByLabelText(/^email address$/i), TEST_PROFILE.email)
    await user.type(screen.getByLabelText(/^password$/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    expect(
      await screen.findByText(/invalid email or password/i),
    ).toBeInTheDocument()
    expect(getAccessToken()).toBeNull()
  })

  it('reports an unreachable backend instead of failing silently', async () => {
    const user = userEvent.setup()
    const api = createFakeAuthApi({
      login: vi.fn(async (): Promise<AuthResponse> => {
        throw new ApiError({
          status: 0,
          message:
            'Unable to reach the Identity Service at http://localhost:8080. Check that the backend is running and that the API base URL is correct.',
          code: 'NETWORK_ERROR',
          isNetworkError: true,
        })
      }),
    })
    renderApp({ api, route: '/login' })

    await user.type(screen.getByLabelText(/^email address$/i), TEST_PROFILE.email)
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /^sign in$/i }))

    expect(
      await screen.findByText(/unable to reach the identity service/i),
    ).toBeInTheDocument()
  })

  it('toggles the visibility of the password field', async () => {
    const user = userEvent.setup()
    renderApp({ route: '/login' })

    const passwordInput = screen.getByLabelText(/^password$/i)
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /show password/i }))

    expect(passwordInput).toHaveAttribute('type', 'text')
    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
