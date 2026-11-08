import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
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

describe('RegisterPage', () => {
  it('renders the registration form', () => {
    renderApp({ route: '/register' })

    expect(
      screen.getByRole('heading', { name: /create your account/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/^first name$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^last name$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email address$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^sign in$/i })).toBeInTheDocument()
  })

  it('reports every missing required field', async () => {
    const user = userEvent.setup()
    const api = createFakeAuthApi()
    renderApp({ api, route: '/register' })

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/first name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    expect(
      screen.getByText(/please confirm your password/i),
    ).toBeInTheDocument()
    expect(api.register).not.toHaveBeenCalled()
  })

  it('rejects a mismatching password confirmation', async () => {
    const user = userEvent.setup()
    const api = createFakeAuthApi()
    renderApp({ api, route: '/register' })

    await user.type(screen.getByLabelText(/^first name$/i), 'Ada')
    await user.type(screen.getByLabelText(/^last name$/i), 'Lovelace')
    await user.type(screen.getByLabelText(/^email address$/i), TEST_PROFILE.email)
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/^confirm password$/i), 'password124')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
    expect(api.register).not.toHaveBeenCalled()
  })

  it('enforces the password length rules of the backend', async () => {
    const user = userEvent.setup()
    const api = createFakeAuthApi()
    renderApp({ api, route: '/register' })

    await user.type(screen.getByLabelText(/^first name$/i), 'Ada')
    await user.type(screen.getByLabelText(/^last name$/i), 'Lovelace')
    await user.type(screen.getByLabelText(/^email address$/i), TEST_PROFILE.email)
    await user.type(screen.getByLabelText(/^password$/i), 'short')
    await user.type(screen.getByLabelText(/^confirm password$/i), 'short')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(
      await screen.findByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument()
    expect(api.register).not.toHaveBeenCalled()
  })

  it('sends only the fields accepted by the backend', async () => {
    const user = userEvent.setup()
    const api = createFakeAuthApi({
      register: vi.fn(async (): Promise<AuthResponse> => createAuthResponse()),
    })
    renderApp({ api, route: '/register' })

    await user.type(screen.getByLabelText(/^first name$/i), 'Ada')
    await user.type(screen.getByLabelText(/^last name$/i), 'Lovelace')
    await user.type(screen.getByLabelText(/^email address$/i), TEST_PROFILE.email)
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/^confirm password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(
      await screen.findByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument()
    expect(api.register).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: TEST_PROFILE.email,
      password: 'password123',
    })
    expect(getAccessToken()).toBe(TEST_TOKEN)
  })

  it('shows the conflict message returned by the backend', async () => {
    const user = userEvent.setup()
    const api = createFakeAuthApi({
      register: vi.fn(async (): Promise<AuthResponse> => {
        throw new ApiError({
          status: 409,
          message: 'An account with this email already exists',
          code: 'CONFLICT',
        })
      }),
    })
    renderApp({ api, route: '/register' })

    await user.type(screen.getByLabelText(/^first name$/i), 'Ada')
    await user.type(screen.getByLabelText(/^last name$/i), 'Lovelace')
    await user.type(screen.getByLabelText(/^email address$/i), TEST_PROFILE.email)
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/^confirm password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(
      await screen.findByText(/an account with this email already exists/i),
    ).toBeInTheDocument()
  })

  it('maps backend field errors onto the matching inputs', async () => {
    const user = userEvent.setup()
    const api = createFakeAuthApi({
      register: vi.fn(async (): Promise<AuthResponse> => {
        throw new ApiError({
          status: 400,
          message: 'Validation failed',
          code: 'VALIDATION_FAILED',
          fieldErrors: { email: 'must be a well-formed email address' },
        })
      }),
    })
    renderApp({ api, route: '/register' })

    await user.type(screen.getByLabelText(/^first name$/i), 'Ada')
    await user.type(screen.getByLabelText(/^last name$/i), 'Lovelace')
    await user.type(screen.getByLabelText(/^email address$/i), TEST_PROFILE.email)
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/^confirm password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(
      await screen.findByText(/must be a well-formed email address/i),
    ).toBeInTheDocument()
  })
})
