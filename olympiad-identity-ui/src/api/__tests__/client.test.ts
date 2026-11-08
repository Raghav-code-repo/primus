import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, type AxiosAdapter, type AxiosResponse } from 'axios'

import { apiClient, setUnauthorizedHandler } from '../client'
import { ApiError } from '../errors'
import { clearSession, setSession } from '../../auth/tokenStorage'

const TEST_TOKEN = 'header.payload.signature'

const originalAdapter = apiClient.defaults.adapter

function seedSession(): void {
  setSession({
    accessToken: TEST_TOKEN,
    tokenType: 'Bearer',
    expiresAt: Date.now() + 60 * 60 * 1000,
  })
}

function okAdapter(
  capture?: (config: { headers: { get(name: string): unknown } }) => void,
): AxiosAdapter {
  return async (config) => {
    capture?.(config)
    return {
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    } as AxiosResponse
  }
}

function errorAdapter(status: number, data: unknown): AxiosAdapter {
  return (config) =>
    Promise.reject(
      new AxiosError(
        `Request failed with status code ${status}`,
        String(status),
        config,
        undefined,
        {
          data,
          status,
          statusText: '',
          headers: {},
          config,
        } as AxiosResponse,
      ),
    )
}

describe('api client', () => {
  beforeEach(() => {
    clearSession()
    setUnauthorizedHandler(null)
  })

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter
    setUnauthorizedHandler(null)
  })

  it('sends the bearer token on authenticated requests', async () => {
    seedSession()
    let authorization: unknown
    apiClient.defaults.adapter = okAdapter((config) => {
      authorization = config.headers.get('Authorization')
    })

    await apiClient.get('/api/auth/me')

    expect(authorization).toBe(`Bearer ${TEST_TOKEN}`)
  })

  it('does not send the bearer token to a different origin', async () => {
    seedSession()
    let authorization: unknown = 'not-called'
    apiClient.defaults.adapter = okAdapter((config) => {
      authorization = config.headers.get('Authorization')
    })

    await apiClient.get('https://unrelated.example.com/data')

    expect(authorization).toBeUndefined()
  })

  it('works without a token', async () => {
    let authorization: unknown = 'not-called'
    apiClient.defaults.adapter = okAdapter((config) => {
      authorization = config.headers.get('Authorization')
    })

    await apiClient.post('/api/auth/login', { email: 'a@b.c', password: 'x' })

    expect(authorization).toBeUndefined()
  })

  it('does not attach the token to the public login and register endpoints', async () => {
    seedSession()
    const seen: unknown[] = []
    apiClient.defaults.adapter = okAdapter((config) => {
      seen.push(config.headers.get('Authorization'))
    })

    await apiClient.post('/api/auth/login', { email: 'a@b.c', password: 'x' })
    await apiClient.post('/api/auth/register', {
      email: 'a@b.c',
      password: 'x',
      firstName: 'A',
      lastName: 'B',
    })

    expect(seen).toEqual([undefined, undefined])
  })

  it('normalises a validation error of the backend', async () => {
    apiClient.defaults.adapter = errorAdapter(400, {
      error: 'VALIDATION_FAILED',
      fields: { email: 'must be a well-formed email address' },
    })

    const error = await apiClient
      .post('/api/auth/register', {})
      .catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(ApiError)
    const apiError = error as ApiError
    expect(apiError.status).toBe(400)
    expect(apiError.fieldErrors).toEqual({
      email: 'must be a well-formed email address',
    })
  })

  it('normalises the ApiError body of the backend', async () => {
    apiClient.defaults.adapter = errorAdapter(409, {
      timestamp: '2026-01-01T00:00:00Z',
      status: 409,
      message: 'An account with this email already exists',
    })

    const error = await apiClient
      .post('/api/auth/register', {})
      .catch((caught: unknown) => caught)

    const apiError = error as ApiError
    expect(apiError).toBeInstanceOf(ApiError)
    expect(apiError.status).toBe(409)
    expect(apiError.message).toBe('An account with this email already exists')
    expect(apiError.isConflict).toBe(true)
  })

  it('triggers the unauthorized handler on 401 for an authenticated request', async () => {
    seedSession()
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    apiClient.defaults.adapter = errorAdapter(401, {
      error: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    })

    await apiClient.get('/api/auth/me').catch(() => undefined)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('keeps the session on 403 and reports an access denied message', async () => {
    seedSession()
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    apiClient.defaults.adapter = errorAdapter(403, {
      error: 'FORBIDDEN',
      message: 'Access denied',
    })

    const error = await apiClient
      .get('/api/admin/users')
      .catch((caught: unknown) => caught)

    const apiError = error as ApiError
    expect(apiError).toBeInstanceOf(ApiError)
    expect(apiError.status).toBe(403)
    expect(apiError.isForbidden).toBe(true)
    expect(apiError.message).toBe('Access denied')
    expect(handler).not.toHaveBeenCalled()
  })

  it('reports a network failure without leaking internals', async () => {
    apiClient.defaults.adapter = (config) =>
      Promise.reject(
        new AxiosError('Network Error', 'ERR_NETWORK', config, undefined),
      )

    const error = await apiClient
      .get('/api/auth/me')
      .catch((caught: unknown) => caught)

    const apiError = error as ApiError
    expect(apiError).toBeInstanceOf(ApiError)
    expect(apiError.isNetworkError).toBe(true)
    expect(apiError.message).toMatch(/unable to reach the identity service/i)
  })
})
