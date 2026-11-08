import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { ApiError } from '../../api/errors'
import { getAccessToken } from '../../auth/tokenStorage'
import {
  ADMIN_PROFILE,
  createFakeAuthApi,
  renderApp,
  seedSession,
} from '../../test/utils'

vi.mock('../../api/adminApi', () => ({
  adminApi: {
    listUsers: vi.fn(),
    listRoles: vi.fn(),
    listPermissions: vi.fn(),
  },
}))

import { adminApi } from '../../api/adminApi'

const mockedAdminApi = vi.mocked(adminApi)

describe('AdminPage', () => {
  it('shows an access denied message when the backend rejects the request', async () => {
    seedSession()
    const api = createFakeAuthApi({
      me: vi.fn(async () => ADMIN_PROFILE),
    })
    mockedAdminApi.listUsers.mockRejectedValue(
      new ApiError({
        status: 403,
        message: 'Access denied',
        code: 'FORBIDDEN',
      }),
    )
    mockedAdminApi.listRoles.mockRejectedValue(
      new ApiError({ status: 403, message: 'Access denied' }),
    )
    mockedAdminApi.listPermissions.mockRejectedValue(
      new ApiError({ status: 403, message: 'Access denied' }),
    )

    renderApp({ api, route: '/admin' })

    expect(
      await screen.findAllByText(/access denied/i),
    ).not.toHaveLength(0)

    // The session stays intact: a 403 must not sign the user out.
    expect(getAccessToken()).not.toBeNull()
    expect(
      screen.getByRole('button', { name: /log out/i }),
    ).toBeInTheDocument()
  })

  it('renders the users returned by the backend', async () => {
    seedSession()
    const api = createFakeAuthApi({
      me: vi.fn(async () => ADMIN_PROFILE),
    })
    mockedAdminApi.listUsers.mockResolvedValue([
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'learner@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        status: 'ACTIVE',
        emailVerified: false,
        roles: ['STUDENT'],
        createdAt: '2026-01-01T00:00:00Z',
      },
    ])
    mockedAdminApi.listRoles.mockResolvedValue([
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'STUDENT',
        description: 'Student access',
        active: true,
      },
    ])
    mockedAdminApi.listPermissions.mockResolvedValue([
      {
        id: '55555555-5555-5555-5555-555555555555',
        code: 'USER_READ',
        description: 'Read user details',
        active: true,
      },
    ])

    renderApp({ api, route: '/admin' })

    expect(
      await screen.findByText('learner@example.com'),
    ).toBeInTheDocument()
    expect(screen.getByText('USER_READ')).toBeInTheDocument()
    expect(screen.getByText('Student access')).toBeInTheDocument()
  })

  it('redirects a user without the ADMIN role to the unauthorized page', async () => {
    seedSession()
    const api = createFakeAuthApi()
    renderApp({ api, route: '/admin' })

    expect(
      await screen.findByRole('heading', { name: /access denied/i }),
    ).toBeInTheDocument()
  })
})
