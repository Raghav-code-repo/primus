import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { AxiosAdapter, AxiosResponse } from 'axios'

import { studentClient } from '../client'
import { studentApi } from '../studentApi'
import { enrollmentApi } from '../enrollmentApi'
import { catalogApi } from '../catalogApi'
import { setSession } from '../../auth/tokenStorage'
import type { StudentProfile } from '../../types/student'

const originalAdapter = studentClient.defaults.adapter

interface Recorded {
  method: string
  url: string
  params?: unknown
  data?: unknown
}

function recordingAdapter(recorded: Recorded[]): AxiosAdapter {
  return async (config) => {
    recorded.push({
      method: (config.method ?? 'get').toUpperCase(),
      url: config.url ?? '',
      params: config.params,
      data: config.data,
    })
    return {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    } as AxiosResponse
  }
}

const PROFILE: StudentProfile = {
  id: 7,
  identityUserId: 'identity-user-id',
  fullName: 'Ada Lovelace',
  grade: 'Grade 6',
  schoolName: 'Olympiad Preparatory School',
  phone: '+49 30 123456',
  createdAt: '2026-10-21T08:51:22Z',
  updatedAt: '2026-10-21T08:51:22Z',
}

describe('the student service api modules', () => {
  let recorded: Recorded[]

  beforeEach(() => {
    recorded = []
    studentClient.defaults.adapter = recordingAdapter(recorded)
    setSession({
      accessToken: 'test.token',
      tokenType: 'Bearer',
      expiresAt: Date.now() + 60000,
    })
  })

  afterEach(() => {
    studentClient.defaults.adapter = originalAdapter
  })

  it('reads the own profile from GET /api/students/me', async () => {
    await studentApi.getMyProfile()

    expect(recorded[0]!.method).toBe('GET')
    expect(recorded[0]!.url).toBe('/api/students/me')
  })

  it('creates the profile with POST /api/students/me', async () => {
    await studentApi.createMyProfile({
      fullName: 'Ada Lovelace',
      grade: 'Grade 6',
      schoolName: 'Olympiad Preparatory School',
      phone: '+49 30 123456',
    })

    expect(recorded[0]!.method).toBe('POST')
    expect(recorded[0]!.url).toBe('/api/students/me')
    expect(JSON.parse(recorded[0]!.data as string)).toEqual({
      fullName: 'Ada Lovelace',
      grade: 'Grade 6',
      schoolName: 'Olympiad Preparatory School',
      phone: '+49 30 123456',
    })
  })

  it('updates the profile with PUT /api/students/me', async () => {
    await studentApi.updateMyProfile({
      fullName: 'Ada Lovelace',
      grade: 'Grade 7',
      schoolName: '',
      phone: '',
    })

    expect(recorded[0]!.method).toBe('PUT')
    expect(recorded[0]!.url).toBe('/api/students/me')
    expect(JSON.parse(recorded[0]!.data as string)).toEqual({
      fullName: 'Ada Lovelace',
      grade: 'Grade 7',
      schoolName: '',
      phone: '',
    })
  })

  it('never sends an identity with the profile request', async () => {
    await studentApi.getMyProfile()
    await studentApi.updateMyProfile({ fullName: 'Ada Lovelace' })

    for (const request of recorded) {
      expect(request.url).toBe('/api/students/me')
      if (request.data) {
        const body = JSON.parse(request.data as string) as Record<string, unknown>
        expect(body.identityUserId).toBeUndefined()
        expect(body.id).toBeUndefined()
        expect(body.roles).toBeUndefined()
      }
    }
  })

  it('reads the own enrollments from GET /api/enrollments/me', async () => {
    await enrollmentApi.listMine()

    expect(recorded[0]!.method).toBe('GET')
    expect(recorded[0]!.url).toBe('/api/enrollments/me')
  })

  it('creates an enrollment with POST /api/enrollments and the course id', async () => {
    await enrollmentApi.create({ courseId: 'course-1' })

    expect(recorded[0]!.method).toBe('POST')
    expect(recorded[0]!.url).toBe('/api/enrollments')
    expect(JSON.parse(recorded[0]!.data as string)).toEqual({
      courseId: 'course-1',
    })
  })

  it('cancels an enrollment with DELETE /api/enrollments/{id}', async () => {
    await enrollmentApi.cancel(42)

    expect(recorded[0]!.method).toBe('DELETE')
    expect(recorded[0]!.url).toBe('/api/enrollments/42')
  })

  it('reads the catalogue from GET /api/courses with the published status', async () => {
    await catalogApi.list({ subject: 'Mathematics', page: 1, size: 20 })

    expect(recorded[0]!.method).toBe('GET')
    expect(recorded[0]!.url).toBe('/api/courses')
    expect(recorded[0]!.params).toEqual({
      status: 'PUBLISHED',
      subject: 'Mathematics',
      page: 1,
      size: 20,
    })
  })

  it('normalises the page wrapper of the course service', async () => {
    // The API Gateway serves /api/courses/** with the Course Service, whose
    // Spring Data page names the index "number" instead of "page".
    studentClient.defaults.adapter = async (config) =>
      ({
        data: {
          content: [
            {
              id: 'course-1',
              code: 'MATH-001',
              title: 'Mathematics',
              description: null,
              subject: 'Mathematics',
              gradeLevel: 'Grade 6',
              status: 'PUBLISHED',
              createdAt: null,
              updatedAt: null,
            },
          ],
          number: 2,
          size: 10,
          totalElements: 21,
          totalPages: 3,
          pageable: {},
          first: false,
          last: false,
          empty: false,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }) as AxiosResponse

    const page = await catalogApi.list()

    expect(page.page).toBe(2)
    expect(page.size).toBe(10)
    expect(page.totalElements).toBe(21)
    expect(page.totalPages).toBe(3)
    expect(page.content).toHaveLength(1)
    expect(page.content[0]?.title).toBe('Mathematics')
  })

  it('keeps the page wrapper of the student service', async () => {
    studentClient.defaults.adapter = async (config) =>
      ({
        data: {
          content: [],
          page: 1,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }) as AxiosResponse

    const page = await catalogApi.list()

    expect(page.page).toBe(1)
    expect(page.totalElements).toBe(0)
  })

  it('reads a single course from GET /api/courses/{id}', async () => {
    await catalogApi.get('course-1')

    expect(recorded[0]!.method).toBe('GET')
    expect(recorded[0]!.url).toBe('/api/courses/course-1')
  })

  it('sends the bearer token to the student service', async () => {
    let authorization: unknown
    studentClient.defaults.adapter = async (config) => {
      authorization = config.headers.get('Authorization')
      return {
        data: PROFILE,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse
    }

    await studentApi.getMyProfile()

    expect(authorization).toBe('Bearer test.token')
  })
})
