import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AxiosAdapter, AxiosResponse } from 'axios'

import { apiClient, courseClient, liveClassClient } from '../../api/client'
import {
  ADMIN_PROFILE,
  TEST_PROFILE,
  TEACHER_PROFILE,
  createFakeAuthApi,
  renderApp,
  seedSession,
} from '../../test/utils'
import type { Course } from '../../types/course'

const originalLiveClassAdapter = liveClassClient.defaults.adapter
const originalCourseAdapter = courseClient.defaults.adapter
const originalApiAdapter = apiClient.defaults.adapter

const MATH_COURSE: Course = {
  id: 'c7e8950e-2801-43d5-b4af-38a9f166cc1a',
  code: 'MATH-OLY-001',
  title: 'Mathematics Olympiad Foundation',
  description: 'Foundational mathematics.',
  subject: 'Mathematics',
  gradeLevel: 'Grade 6',
  status: 'PUBLISHED',
  createdAt: '2026-10-21T08:51:22.670375Z',
  updatedAt: '2026-10-21T08:51:22.670375Z',
}

const PHYSICS_COURSE: Course = {
  id: '2b2f4a18-1c9d-4a0e-9c47-6f3b2f0a1d55',
  code: 'PHYS-OLY-002',
  title: 'Physics Olympiad Preparation',
  description: 'Advanced physics.',
  subject: 'Physics',
  gradeLevel: 'Grade 8',
  status: 'PUBLISHED',
  createdAt: '2026-10-21T08:51:22.670375Z',
  updatedAt: '2026-10-21T08:51:22.670375Z',
}

const CREATED_CLASS = {
  id: 'a1b2c3d4-1111-2222-3333-444444444444',
  courseId: MATH_COURSE.id,
  teacherId: TEACHER_PROFILE.id,
  title: 'Olympiad Mathematics - Live Session',
  description: 'Advanced problem-solving practice',
  scheduledStart: '2026-11-02T08:00:00.000Z',
  scheduledEnd: '2026-11-02T09:00:00.000Z',
  status: 'SCHEDULED' as const,
  roomName: 'olympiad-math-session',
}

interface Recorded {
  method?: string
  url?: string
  baseURL?: string
  data?: unknown
  headers?: unknown
}

function recordingAdapter(recorded: Recorded[], response: unknown): AxiosAdapter {
  return async (config) => {
    recorded.push({
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      data: config.data,
      headers: config.headers,
    })
    return {
      data: response,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    } as AxiosResponse
  }
}

function rejectingAdapter(status: number, body: unknown): AxiosAdapter {
  return async (config) =>
    Promise.reject(
      Object.assign(new Error('rejected'), {
        isAxiosError: true,
        config,
        response: {
          status,
          data: body,
          headers: {},
          statusText: '',
          config,
        },
      }),
    )
}

function authorizationHeader(headers: unknown): string | undefined {
  if (!headers || typeof headers !== 'object') {
    return undefined
  }
  const record = headers as Record<string, unknown>
  const direct = record['authorization']
  if (typeof direct === 'string') {
    return direct
  }
  const axiosHeaders = headers as { get?: (name: string) => string | undefined }
  if (typeof axiosHeaders.get === 'function') {
    return axiosHeaders.get('authorization')
  }
  return undefined
}

async function fillCreateForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: {
    title?: string
    courseId?: string
    startDate?: string
    startTime?: string
    endDate?: string
    endTime?: string
  } = {},
) {
  const titleInput = await screen.findByLabelText(/live class title/i)
  await user.clear(titleInput)
  await user.type(
    titleInput,
    overrides.title ?? 'Olympiad Mathematics - Live Session',
  )

  const courseSelect = screen.getByLabelText(/^course$/i)
  await waitFor(() => {
    expect(
      courseSelect.querySelector(
        `option[value="${overrides.courseId ?? MATH_COURSE.id}"]`,
      ),
    ).toBeInTheDocument()
  })
  await user.selectOptions(courseSelect, overrides.courseId ?? MATH_COURSE.id)

  const startDateInput = await screen.findByLabelText(/scheduled start date/i)
  fireEvent.change(startDateInput, { target: { value: overrides.startDate ?? '2026-11-02' } })
  const startTimeInput = await screen.findByLabelText(/^start time$/i)
  fireEvent.change(startTimeInput, { target: { value: overrides.startTime ?? '08:00' } })

  const endDateInput = await screen.findByLabelText(/scheduled end date/i)
  fireEvent.change(endDateInput, { target: { value: overrides.endDate ?? '2026-11-02' } })
  const endTimeInput = await screen.findByLabelText(/^end time$/i)
  fireEvent.change(endTimeInput, { target: { value: overrides.endTime ?? '09:00' } })
}

describe('CreateLiveClassPage', () => {
  beforeEach(() => {
    seedSession()
  })

  afterEach(() => {
    liveClassClient.defaults.adapter = originalLiveClassAdapter
    courseClient.defaults.adapter = originalCourseAdapter
    apiClient.defaults.adapter = originalApiAdapter
    vi.restoreAllMocks()
  })

  it('is not reachable by a student without LIVE_CLASS_CREATE', async () => {
    const api = createFakeAuthApi({
      me: vi.fn(async () => TEST_PROFILE),
      permissions: vi.fn(async () => ({
        subject: TEST_PROFILE.email,
        authorities: ['LIVE_CLASS_READ', 'ROLE_STUDENT'],
      })),
    })
    renderApp({ api, route: '/live-classes/create' })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /access denied/i })).toBeInTheDocument()
    })
  })

  it('lets a teacher create a live class and derives the teacher identity', async () => {
    const recorded: Recorded[] = []
    liveClassClient.defaults.adapter = recordingAdapter(recorded, CREATED_CLASS)
    courseClient.defaults.adapter = recordingAdapter(
      [],
      { content: [MATH_COURSE, PHYSICS_COURSE], totalElements: 2 },
    )
    // Teachers do not use the teacher list; return none so nothing blocks them.
    apiClient.defaults.adapter = recordingAdapter([], [])

    const api = createFakeAuthApi({
      me: vi.fn(async () => TEACHER_PROFILE),
      permissions: vi.fn(async () => ({
        subject: TEACHER_PROFILE.email,
        authorities: [
          'LIVE_CLASS_CREATE',
          'LIVE_CLASS_READ',
          'LIVE_CLASS_JOIN',
          'ROLE_TEACHER',
        ],
      })),
    })
    renderApp({ api, route: '/live-classes/create' })

    const user = userEvent.setup()
    await screen.findByRole('heading', { name: /create live class/i })
    await fillCreateForm(user)
    await user.click(
      screen.getByRole('button', { name: /create live class/i }),
    )

    await waitFor(() => {
      expect(recorded.some((r) => r.method === 'post')).toBe(true)
    })

    const post = recorded.find((r) => r.method === 'post')
    expect(post?.url).toBe('/api/live-classes')
    expect(post?.baseURL).toContain('8088')
    expect(authorizationHeader(post?.headers)).toMatch(/^Bearer /)

    const payload = JSON.parse(post?.data as string)
    const expectedStart = new Date(2026, 10, 2, 8, 0, 0).toISOString()
    const expectedEnd = new Date(2026, 10, 2, 9, 0, 0).toISOString()
    expect(payload).toMatchObject({
      courseId: MATH_COURSE.id,
      title: 'Olympiad Mathematics - Live Session',
      scheduledStart: expectedStart,
      scheduledEnd: expectedEnd,
    })
    // The teacher identity is derived from the authenticated principal and is
    // not sent to the backend.
    expect(payload.teacherId).toBeUndefined()

    await waitFor(() => {
      expect(screen.getByText(/live class created/i)).toBeInTheDocument()
    })
  })

  it('lets an admin create a live class assigned to a selected teacher', async () => {
    const recorded: Recorded[] = []
    liveClassClient.defaults.adapter = recordingAdapter(recorded, CREATED_CLASS)
    courseClient.defaults.adapter = recordingAdapter(
      [],
      { content: [MATH_COURSE, PHYSICS_COURSE], totalElements: 2 },
    )
    apiClient.defaults.adapter = recordingAdapter(
      [],
      [
        {
          id: TEACHER_PROFILE.id,
          email: TEACHER_PROFILE.email,
          firstName: TEACHER_PROFILE.firstName,
          lastName: TEACHER_PROFILE.lastName,
          roles: ['TEACHER'],
          status: 'ACTIVE',
          emailVerified: true,
          createdAt: '2026-10-21T08:51:22.670375Z',
          updatedAt: '2026-10-21T08:51:22.670375Z',
        },
      ],
    )

    const api = createFakeAuthApi({
      me: vi.fn(async () => ADMIN_PROFILE),
      permissions: vi.fn(async () => ({
        subject: ADMIN_PROFILE.email,
        authorities: [
          'LIVE_CLASS_CREATE',
          'LIVE_CLASS_READ',
          'ROLE_ADMIN',
        ],
      })),
    })
    renderApp({ api, route: '/live-classes/create' })

    const user = userEvent.setup()
    await screen.findByRole('heading', { name: /create live class/i })

    // The teacher dropdown is rendered and required for administrators.
    await screen.findByLabelText(/^teacher$/i)

    await fillCreateForm(user, { courseId: PHYSICS_COURSE.id })

    const teacherSelect = screen.getByLabelText(/^teacher$/i)
    await waitFor(() => {
      expect(
        teacherSelect.querySelector(`option[value="${TEACHER_PROFILE.id}"]`),
      ).toBeInTheDocument()
    })
    await user.selectOptions(teacherSelect, TEACHER_PROFILE.id)
    await user.click(
      screen.getByRole('button', { name: /create live class/i }),
    )

    await waitFor(() => {
      expect(recorded.some((r) => r.method === 'post')).toBe(true)
    })

    const post = recorded.find((r) => r.method === 'post')
    const payload = JSON.parse(post?.data as string)
    expect(payload).toMatchObject({
      courseId: PHYSICS_COURSE.id,
      teacherId: TEACHER_PROFILE.id,
      title: 'Olympiad Mathematics - Live Session',
    })
  })

  it('validates the form before sending a request', async () => {
    const recorded: Recorded[] = []
    liveClassClient.defaults.adapter = recordingAdapter(recorded, CREATED_CLASS)
    courseClient.defaults.adapter = recordingAdapter(
      [],
      { content: [MATH_COURSE], totalElements: 1 },
    )
    apiClient.defaults.adapter = recordingAdapter([], [])

    const api = createFakeAuthApi({
      me: vi.fn(async () => TEACHER_PROFILE),
      permissions: vi.fn(async () => ({
        subject: TEACHER_PROFILE.email,
        authorities: ['LIVE_CLASS_CREATE', 'LIVE_CLASS_READ', 'ROLE_TEACHER'],
      })),
    })
    renderApp({ api, route: '/live-classes/create' })

    const user = userEvent.setup()
    await screen.findByRole('heading', { name: /create live class/i })
    await screen.findByRole('button', { name: /create live class/i })
    await user.click(screen.getByRole('button', { name: /create live class/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/live class title/i)).toHaveAttribute(
        'aria-invalid',
        'true',
      )
    })
    await waitFor(() => {
      expect(screen.getByLabelText(/^course$/i)).toHaveAttribute(
        'aria-invalid',
        'true',
      )
    })
    expect(recorded).toHaveLength(0)
  })

  it('requires the end time to be after the start time', async () => {
    const recorded: Recorded[] = []
    liveClassClient.defaults.adapter = recordingAdapter(recorded, CREATED_CLASS)
    courseClient.defaults.adapter = recordingAdapter(
      [],
      { content: [MATH_COURSE], totalElements: 1 },
    )
    apiClient.defaults.adapter = recordingAdapter([], [])

    const api = createFakeAuthApi({
      me: vi.fn(async () => TEACHER_PROFILE),
      permissions: vi.fn(async () => ({
        subject: TEACHER_PROFILE.email,
        authorities: ['LIVE_CLASS_CREATE', 'LIVE_CLASS_READ', 'ROLE_TEACHER'],
      })),
    })
    renderApp({ api, route: '/live-classes/create' })

    const user = userEvent.setup()
    await screen.findByRole('heading', { name: /create live class/i })
    await fillCreateForm(user, {
      startTime: '10:00',
      endTime: '09:00',
    })
    await user.click(screen.getByRole('button', { name: /create live class/i }))

    expect(await screen.findByText(/end time must be after start time/i)).toBeInTheDocument()
    expect(recorded).toHaveLength(0)
  })

  it('shows backend validation errors as field errors', async () => {
    liveClassClient.defaults.adapter = rejectingAdapter(400, {
      type: 'https://olympiad.example/problems/invalid-request',
      title: 'Invalid request',
      status: 400,
      detail: 'title: must not be blank; courseId: must not be null',
    })
    courseClient.defaults.adapter = recordingAdapter(
      [],
      { content: [MATH_COURSE], totalElements: 1 },
    )
    apiClient.defaults.adapter = recordingAdapter([], [])

    const api = createFakeAuthApi({
      me: vi.fn(async () => TEACHER_PROFILE),
      permissions: vi.fn(async () => ({
        subject: TEACHER_PROFILE.email,
        authorities: ['LIVE_CLASS_CREATE', 'LIVE_CLASS_READ', 'ROLE_TEACHER'],
      })),
    })
    renderApp({ api, route: '/live-classes/create' })

    const user = userEvent.setup()
    await screen.findByRole('heading', { name: /create live class/i })
    await fillCreateForm(user)
    await user.click(screen.getByRole('button', { name: /create live class/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/must not be blank/i),
      ).toBeInTheDocument()
    })
  })

  it('requires a teacher for administrators', async () => {
    const recorded: Recorded[] = []
    liveClassClient.defaults.adapter = recordingAdapter(recorded, CREATED_CLASS)
    courseClient.defaults.adapter = recordingAdapter(
      [],
      { content: [MATH_COURSE], totalElements: 1 },
    )
    apiClient.defaults.adapter = recordingAdapter([], [])

    const api = createFakeAuthApi({
      me: vi.fn(async () => ADMIN_PROFILE),
      permissions: vi.fn(async () => ({
        subject: ADMIN_PROFILE.email,
        authorities: ['LIVE_CLASS_CREATE', 'LIVE_CLASS_READ', 'ROLE_ADMIN'],
      })),
    })
    renderApp({ api, route: '/live-classes/create' })

    const user = userEvent.setup()
    await screen.findByRole('heading', { name: /create live class/i })
    await fillCreateForm(user)
    await user.click(screen.getByRole('button', { name: /create live class/i }))

    const teacherInput = screen.getByLabelText(/^teacher$/i)
    expect(teacherInput).toHaveAttribute('aria-invalid', 'true')
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/select a teacher/i)
    })
    expect(recorded).toHaveLength(0)
  })
})
