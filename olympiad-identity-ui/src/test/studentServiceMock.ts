import type { AxiosAdapter, AxiosResponse } from 'axios'

import type { CatalogCourse } from '../types/course'
import type { Enrollment, StudentProfile } from '../types/student'

/**
 * A fake Student Service for the tests.
 *
 * The adapter answers the endpoints the frontend really uses:
 *
 *  - GET  /api/students/me
 *  - POST /api/students/me
 *  - PUT  /api/students/me
 *  - GET  /api/courses
 *  - GET  /api/courses/{id}
 *  - GET  /api/enrollments/me
 *  - POST /api/enrollments
 *  - DELETE /api/enrollments/{id}
 *
 * Every endpoint can be overridden with an error so the error handling of the
 * interface can be tested against the real status codes of the backend.
 */
export interface StudentServiceMock {
  profile: StudentProfile | null
  courses: CatalogCourse[]
  enrollments: Enrollment[]
  /** Overrides the answer of one endpoint, for example `POST /api/enrollments`. */
  failures: Record<string, { status: number; data?: unknown }>
  /** The requests the frontend sent, in order. */
  requests: { method: string; url: string; body?: unknown }[]
}

export function createStudentServiceMock(
  overrides: Partial<StudentServiceMock> = {},
): StudentServiceMock {
  return {
    profile: null,
    courses: [],
    enrollments: [],
    failures: {},
    requests: [],
    ...overrides,
  }
}

function pathOf(url: string | undefined): string {
  if (!url) {
    return ''
  }
  const [path = ''] = url.split('?')
  return path
}

function respond(
  config: Parameters<AxiosAdapter>[0],
  status: number,
  data: unknown,
): AxiosResponse {
  const response = {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
  } as AxiosResponse

  if (status >= 400) {
    // A real adapter rejects a response that is not a success status, so the
    // error handling of the frontend is exercised the same way.
    return Promise.reject(
      Object.assign(new Error('Request failed with status ' + status), {
        isAxiosError: true,
        config,
        response,
      }),
    ) as unknown as AxiosResponse
  }

  return response
}

/**
 * Builds the Axios adapter of the fake Student Service.
 */
export function studentServiceAdapter(
  mock: StudentServiceMock,
): AxiosAdapter {
  return async (config) => {
    const method = (config.method ?? 'get').toUpperCase()
    const path = pathOf(config.url)
    const key = `${method} ${path}`

    let body: unknown
    if (typeof config.data === 'string') {
      try {
        body = JSON.parse(config.data)
      } catch {
        body = config.data
      }
    }

    mock.requests.push({ method, url: path, body })

    const failure = mock.failures[key]
    if (failure) {
      return Promise.reject(
        Object.assign(new Error('Request failed'), {
          isAxiosError: true,
          config,
          response: {
            status: failure.status,
            data: failure.data ?? {},
            headers: {},
            statusText: '',
            config,
          },
        }),
      )
    }

    if (key === 'GET /api/students/me') {
      if (!mock.profile) {
        return respond(config, 404, {
          timestamp: '2026-10-22T09:00:00Z',
          status: 404,
          message: 'Student profile not found',
        })
      }
      return respond(config, 200, mock.profile)
    }

    if (key === 'POST /api/students/me') {
      if (mock.profile) {
        return respond(config, 409, {
          timestamp: '2026-10-22T09:00:00Z',
          status: 409,
          message: 'A student profile already exists for this identity',
        })
      }
      const payload = (body ?? {}) as Partial<StudentProfile>
      mock.profile = {
        id: 1,
        identityUserId: 'identity-user-id',
        fullName: payload.fullName ?? '',
        grade: payload.grade ?? null,
        schoolName: payload.schoolName ?? null,
        phone: payload.phone ?? null,
        createdAt: '2026-10-22T09:00:00Z',
        updatedAt: '2026-10-22T09:00:00Z',
      }
      return respond(config, 201, mock.profile)
    }

    if (key === 'PUT /api/students/me') {
      if (!mock.profile) {
        return respond(config, 404, {
          timestamp: '2026-10-22T09:00:00Z',
          status: 404,
          message: 'Student profile not found',
        })
      }
      const payload = (body ?? {}) as Partial<StudentProfile>
      mock.profile = {
        ...mock.profile,
        fullName: payload.fullName ?? mock.profile.fullName,
        grade: payload.grade ?? mock.profile.grade,
        schoolName: payload.schoolName ?? mock.profile.schoolName,
        phone: payload.phone ?? mock.profile.phone,
        updatedAt: '2026-10-22T10:00:00Z',
      }
      return respond(config, 200, mock.profile)
    }

    if (key === 'GET /api/courses') {
      const params = (config.params ?? {}) as Record<string, unknown>
      const subject =
        typeof params.subject === 'string' ? params.subject : null
      const size = Number(params.size ?? 10)
      const page = Number(params.page ?? 0)

      const filtered = subject
        ? mock.courses.filter(
            (course) =>
              course.subject.toLowerCase() === subject.toLowerCase(),
          )
        : mock.courses

      const start = page * size
      const content = filtered.slice(start, start + size)

      return respond(config, 200, {
        content,
        page,
        size,
        totalElements: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      })
    }

    if (method === 'GET' && path.startsWith('/api/courses/')) {
      const id = path.slice('/api/courses/'.length)
      const course = mock.courses.find((item) => item.id === id)
      if (!course) {
        return respond(config, 404, {
          timestamp: '2026-10-22T09:00:00Z',
          status: 404,
          message: `Course not found: ${id}`,
        })
      }
      return respond(config, 200, course)
    }

    if (key === 'GET /api/enrollments/me') {
      return respond(config, 200, mock.enrollments)
    }

    if (key === 'POST /api/enrollments') {
      const payload = (body ?? {}) as { courseId?: string }
      const courseId = payload.courseId ?? ''
      const existing = mock.enrollments.find(
        (item) => item.courseId === courseId && item.status === 'ACTIVE',
      )
      if (existing) {
        return respond(config, 409, {
          timestamp: '2026-10-22T09:00:00Z',
          status: 409,
          message: 'The student is already enrolled in this course',
        })
      }
      const course = mock.courses.find((item) => item.id === courseId)
      if (!course) {
        return respond(config, 404, {
          timestamp: '2026-10-22T09:00:00Z',
          status: 404,
          message: `Course not found: ${courseId}`,
        })
      }
      if (course.status !== 'PUBLISHED') {
        return respond(config, 422, {
          timestamp: '2026-10-22T09:00:00Z',
          status: 422,
          message: `Course is not open for enrollment (status: ${course.status})`,
        })
      }
      const enrollment: Enrollment = {
        id: mock.enrollments.length + 100,
        identityUserId: 'identity-user-id',
        studentProfileId: mock.profile?.id ?? null,
        courseId,
        status: 'ACTIVE',
        createdAt: '2026-10-22T09:30:00Z',
        updatedAt: '2026-10-22T09:30:00Z',
      }
      mock.enrollments = [enrollment, ...mock.enrollments]
      return respond(config, 201, enrollment)
    }

    if (method === 'DELETE' && path.startsWith('/api/enrollments/')) {
      const id = Number(path.slice('/api/enrollments/'.length))
      mock.enrollments = mock.enrollments.map((item) =>
        item.id === id ? { ...item, status: 'CANCELLED' } : item,
      )
      return respond(config, 204, null)
    }

    return respond(config, 404, {
      timestamp: '2026-10-22T09:00:00Z',
      status: 404,
      message: `No fake endpoint for ${method} ${path}`,
    })
  }
}
