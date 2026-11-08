import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, type AxiosAdapter, type AxiosResponse } from 'axios'

import { courseApi } from '../courseApi'
import { courseClient } from '../client'
import { ApiError } from '../errors'
import { clearSession, setSession } from '../../auth/tokenStorage'

const TEST_TOKEN = 'header.payload.signature'
const originalAdapter = courseClient.defaults.adapter

function seedSession(): void {
  setSession({
    accessToken: TEST_TOKEN,
    tokenType: 'Bearer',
    expiresAt: Date.now() + 60 * 60 * 1000,
  })
}

function captureAdapter(
  capture: (config: {
    url?: string
    method?: string
    data?: unknown
    params?: unknown
    headers: { get(name: string): unknown }
  }) => void,
  data: unknown = { content: [] },
): AxiosAdapter {
  return async (config) => {
    capture(config as never)
    return {
      data,
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

describe('course api client', () => {
  beforeEach(() => {
    clearSession()
  })

  afterEach(() => {
    courseClient.defaults.adapter = originalAdapter
    vi.restoreAllMocks()
  })

  it('sends the bearer token of the identity session to the course service', async () => {
    seedSession()
    let authorization: unknown
    courseClient.defaults.adapter = captureAdapter((config) => {
      authorization = config.headers.get('Authorization')
    })

    await courseApi.list()

    expect(authorization).toBe(`Bearer ${TEST_TOKEN}`)
  })

  it('requests the course list and returns the page of the backend', async () => {
    const page = {
      content: [
        {
          id: 'c7e8950e-2801-43d5-b4af-38a9f166cc1a',
          code: 'MATH-OLY-001',
          title: 'Mathematics Olympiad Foundation',
          description: null,
          subject: 'Mathematics',
          gradeLevel: 'Grade 6',
          status: 'DRAFT',
          createdAt: '2026-10-21T08:51:22.670375Z',
          updatedAt: '2026-10-21T08:51:22.670375Z',
        },
      ],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10,
      numberOfElements: 1,
      first: true,
      last: true,
      empty: false,
    }
    let requestedUrl: string | undefined
    let requestedParams: unknown
    courseClient.defaults.adapter = captureAdapter(
      (config) => {
        requestedUrl = config.url
        requestedParams = config.params
      },
      page,
    )

    const result = await courseApi.list({ status: 'DRAFT', subject: 'Math' })

    expect(requestedUrl).toBe('/api/courses')
    expect(requestedParams).toMatchObject({ status: 'DRAFT', subject: 'Math' })
    expect(result.content).toHaveLength(1)
    expect(result.content[0]?.code).toBe('MATH-OLY-001')
  })

  it('omits empty filters from the query', async () => {
    let requestedParams: unknown
    courseClient.defaults.adapter = captureAdapter((config) => {
      requestedParams = config.params
    })

    await courseApi.list({ status: '', subject: '   ' })

    expect(requestedParams).toEqual({})
  })

  it('creates a course with the request dto of the backend', async () => {
    let method: string | undefined
    let body: unknown
    courseClient.defaults.adapter = captureAdapter(
      (config) => {
        method = config.method
        body = config.data
      },
      { id: 'new-id' },
    )

    const payload = {
      code: 'PHY-001',
      title: 'Physics',
      description: 'Mechanics',
      subject: 'Physics',
      gradeLevel: 'Grade 7',
      status: 'DRAFT' as const,
    }
    await courseApi.create(payload)

    expect(method).toBe('post')
    expect(JSON.parse(body as string)).toEqual(payload)
  })

  it('updates and deletes a course through the matching verbs', async () => {
    const calls: string[] = []
    courseClient.defaults.adapter = captureAdapter((config) => {
      calls.push(`${config.method} ${config.url}`)
    })

    await courseApi.update('course-1', {
      code: 'PHY-001',
      title: 'Physics',
      subject: 'Physics',
      gradeLevel: 'Grade 7',
      status: 'PUBLISHED',
    })
    await courseApi.remove('course-1')

    expect(calls).toEqual([
      'put /api/courses/course-1',
      'delete /api/courses/course-1',
    ])
  })

  it('normalises the problem detail body of the course service', async () => {
    courseClient.defaults.adapter = errorAdapter(400, {
      type: 'https://olympiad.example/problems/invalid-request',
      title: 'Invalid request',
      status: 400,
      detail: 'code: must not be blank; title: must not be blank',
    })

    const error = await courseApi
      .create({
        code: '',
        title: '',
        subject: '',
        gradeLevel: '',
        status: 'DRAFT',
      })
      .catch((caught: unknown) => caught)

    const apiError = error as ApiError
    expect(apiError).toBeInstanceOf(ApiError)
    expect(apiError.status).toBe(400)
    expect(apiError.fieldErrors).toEqual({
      code: 'must not be blank',
      title: 'must not be blank',
    })
  })

  it('reports a forbidden request without ending the session', async () => {
    seedSession()
    courseClient.defaults.adapter = errorAdapter(403, {
      title: 'Access Denied',
      status: 403,
    })

    const error = await courseApi
      .create({
        code: 'PHY-001',
        title: 'Physics',
        subject: 'Physics',
        gradeLevel: 'Grade 7',
        status: 'DRAFT',
      })
      .catch((caught: unknown) => caught)

    const apiError = error as ApiError
    expect(apiError.isForbidden).toBe(true)
  })
})
