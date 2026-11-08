import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AxiosAdapter, AxiosResponse } from 'axios'

import { courseClient } from '../../api/client'
import {
  COURSE_MANAGER_AUTHORITIES,
  createFakeAuthApi,
  renderApp,
  seedSession,
} from '../../test/utils'
import type { Course } from '../../types/course'

const originalAdapter = courseClient.defaults.adapter

const COURSE: Course = {
  id: 'c7e8950e-2801-43d5-b4af-38a9f166cc1a',
  code: 'MATH-OLY-001',
  title: 'Mathematics Olympiad Foundation',
  description: 'Foundational mathematics.',
  subject: 'Mathematics',
  gradeLevel: 'Grade 6',
  status: 'DRAFT',
  createdAt: '2026-10-21T08:51:22.670375Z',
  updatedAt: '2026-10-21T08:51:22.670375Z',
}

interface Recorded {
  method?: string
  url?: string
  data?: unknown
}

function recordingAdapter(
  recorded: Recorded[],
  response: unknown = COURSE,
): AxiosAdapter {
  return async (config) => {
    recorded.push({
      method: config.method,
      url: config.url,
      data: config.data,
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

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^code$/i), 'PHY-001')
  await user.type(screen.getByLabelText(/^grade level$/i), 'Grade 7')
  await user.type(screen.getByLabelText(/^title$/i), 'Physics Basics')
  await user.type(screen.getByLabelText(/^subject$/i), 'Physics')
  await user.type(
    screen.getByLabelText(/^description$/i),
    'Kinematics and dynamics.',
  )
  await user.selectOptions(screen.getByLabelText(/^status$/i), 'PUBLISHED')
}

describe('CourseFormPage', () => {
  beforeEach(() => {
    seedSession()
  })

  afterEach(() => {
    courseClient.defaults.adapter = originalAdapter
    vi.restoreAllMocks()
  })

  it('creates a course with the request dto of the backend', async () => {
    const recorded: Recorded[] = []
    courseClient.defaults.adapter = recordingAdapter(recorded)

    const api = createFakeAuthApi({
      permissions: vi.fn(async () => COURSE_MANAGER_AUTHORITIES),
    })
    renderApp({ api, route: '/admin/courses/new' })

    const user = userEvent.setup()
    await screen.findByRole('heading', { name: /new course/i })
    await fillForm(user)
    await user.click(
      screen.getByRole('button', { name: /create the course/i }),
    )

    await waitFor(() => {
      expect(recorded.some((r) => r.method === 'post')).toBe(true)
    })

    const post = recorded.find((r) => r.method === 'post')
    expect(post?.url).toBe('/api/courses')
    expect(JSON.parse(post?.data as string)).toEqual({
      code: 'PHY-001',
      title: 'Physics Basics',
      description: 'Kinematics and dynamics.',
      subject: 'Physics',
      gradeLevel: 'Grade 7',
      status: 'PUBLISHED',
    })
  })

  it('validates the form before it sends a request', async () => {
    const recorded: Recorded[] = []
    courseClient.defaults.adapter = recordingAdapter(recorded)

    const api = createFakeAuthApi({
      permissions: vi.fn(async () => COURSE_MANAGER_AUTHORITIES),
    })
    renderApp({ api, route: '/admin/courses/new' })

    const user = userEvent.setup()
    await screen.findByRole('heading', { name: /new course/i })
    await user.click(
      screen.getByRole('button', { name: /create the course/i }),
    )

    expect(
      await screen.findByText(/code is required/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/title is required/i),
    ).toBeInTheDocument()
    expect(recorded).toHaveLength(0)
  })

  it('shows the field errors of a rejected course request', async () => {
    courseClient.defaults.adapter = (config) =>
      Promise.reject(
        Object.assign(new Error('bad request'), {
          isAxiosError: true,
          config,
          response: {
            status: 400,
            data: {
              type: 'https://olympiad.example/problems/invalid-request',
              title: 'Invalid request',
              status: 400,
              detail: 'code: must not be blank',
            },
            headers: {},
            statusText: '',
            config,
          },
        }),
      )

    const api = createFakeAuthApi({
      permissions: vi.fn(async () => COURSE_MANAGER_AUTHORITIES),
    })
    renderApp({ api, route: '/admin/courses/new' })

    const user = userEvent.setup()
    await screen.findByRole('heading', { name: /new course/i })
    await fillForm(user)
    await user.click(
      screen.getByRole('button', { name: /create the course/i }),
    )

    // The problem detail of the Course Service is mapped back onto the field
    // that was rejected instead of a generic error message.
    expect(
      await screen.findByText(/must not be blank/i),
    ).toBeInTheDocument()
  })

  it('loads the course into the form when editing', async () => {
    const recorded: Recorded[] = []
    courseClient.defaults.adapter = recordingAdapter(recorded)

    const api = createFakeAuthApi({
      permissions: vi.fn(async () => COURSE_MANAGER_AUTHORITIES),
    })
    renderApp({ api, route: `/admin/courses/${COURSE.id}/edit` })

    await screen.findByRole('heading', { name: /edit course/i })

    await waitFor(() => {
      expect(
        (screen.getByLabelText(/^code$/i) as HTMLInputElement).value,
      ).toBe(COURSE.code)
    })
    expect(
      (screen.getByLabelText(/^title$/i) as HTMLInputElement).value,
    ).toBe(COURSE.title)
    expect(
      (screen.getByLabelText(/^status$/i) as HTMLSelectElement).value,
    ).toBe(COURSE.status)
  })

  it('sends the update with the PUT verb of the backend', async () => {
    const recorded: Recorded[] = []
    courseClient.defaults.adapter = recordingAdapter(recorded)

    const api = createFakeAuthApi({
      permissions: vi.fn(async () => COURSE_MANAGER_AUTHORITIES),
    })
    renderApp({ api, route: `/admin/courses/${COURSE.id}/edit` })

    const user = userEvent.setup()
    await screen.findByRole('heading', { name: /edit course/i })
    await waitFor(() => {
      expect(
        (screen.getByLabelText(/^code$/i) as HTMLInputElement).value,
      ).toBe(COURSE.code)
    })

    await user.clear(screen.getByLabelText(/^title$/i))
    await user.type(screen.getByLabelText(/^title$/i), 'Updated title')
    await user.click(
      screen.getByRole('button', { name: /save the changes/i }),
    )

    await waitFor(() => {
      expect(recorded.some((r) => r.method === 'put')).toBe(true)
    })

    const put = recorded.find((r) => r.method === 'put')
    expect(put?.url).toBe(`/api/courses/${COURSE.id}`)
    expect(JSON.parse(put?.data as string)).toMatchObject({
      title: 'Updated title',
      code: COURSE.code,
    })
  })
})
