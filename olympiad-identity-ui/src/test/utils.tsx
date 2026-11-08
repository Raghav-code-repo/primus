import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import type { Mocked } from 'vitest'

import { AuthProvider } from '../auth/AuthProvider'
import { setSession } from '../auth/tokenStorage'
import { AppRoutes } from '../routes/AppRoutes'
import { ThemeProvider } from '../theme/ThemeProvider'
import { ToastProvider } from '../components/Toast'
import type { AuthApi } from '../api/authApi'
import type {
  AuthResponse,
  AuthUserProfile,
  CurrentAuthoritiesResponse,
} from '../types/auth'
import type { CatalogCourse } from '../types/course'
import type { Enrollment, StudentProfile } from '../types/student'

export type MockedAuthApi = Mocked<AuthApi>

export const TEST_TOKEN = 'test.access.token'

export const TEST_PROFILE: AuthUserProfile = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'learner@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
  roles: ['STUDENT'],
}

export const ADMIN_PROFILE: AuthUserProfile = {
  id: '22222222-2222-2222-2222-222222222222',
  email: 'admin@example.com',
  firstName: 'Grace',
  lastName: 'Hopper',
  roles: ['ADMIN'],
}

export const TEACHER_PROFILE: AuthUserProfile = {
  id: '33333333-3333-3333-3333-333333333333',
  email: 'teacher@example.com',
  firstName: 'Alan',
  lastName: 'Turing',
  roles: ['TEACHER'],
}

/** Authorities of an account that may only read courses. */
export const STUDENT_AUTHORITIES: CurrentAuthoritiesResponse = {
  subject: TEST_PROFILE.email,
  authorities: ['COURSE_READ', 'ROLE_STUDENT'],
}

/** Authorities of an account that may manage courses. */
export const COURSE_MANAGER_AUTHORITIES: CurrentAuthoritiesResponse = {
  subject: 'manager@example.com',
  authorities: [
    'COURSE_CREATE',
    'COURSE_DELETE',
    'COURSE_READ',
    'COURSE_UPDATE',
    'ROLE_COURSE_MANAGER',
  ],
}

/** Authorities of a student without any mapped permission. */
export const PLAIN_STUDENT_AUTHORITIES: CurrentAuthoritiesResponse = {
  subject: TEST_PROFILE.email,
  authorities: ['ROLE_STUDENT'],
}

/** A published course of the catalogue of the Student Service. */
export const PUBLISHED_COURSE: CatalogCourse = {
  id: 'c7e8950e-2801-43d5-b4af-38a9f166cc1a',
  code: 'MATH-OLY-001',
  title: 'Mathematics Olympiad Foundation',
  description: 'Foundational mathematics for the olympiad.',
  subject: 'Mathematics',
  gradeLevel: 'Grade 6',
  status: 'PUBLISHED',
  createdAt: '2026-10-21T08:51:22.670375Z',
  updatedAt: '2026-10-21T08:51:22.670375Z',
}

/** A course that is still a draft and must not be offered for enrollment. */
export const DRAFT_COURSE: CatalogCourse = {
  ...PUBLISHED_COURSE,
  id: '2b2f4a18-1c9d-4a0e-9c47-6f3b2f0a1d55',
  code: 'PHYS-OLY-002',
  title: 'Physics Olympiad Preparation',
  status: 'DRAFT',
}

/** The student profile of the signed-in student. */
export const STUDENT_PROFILE: StudentProfile = {
  id: 7,
  identityUserId: TEST_PROFILE.id,
  fullName: 'Ada Lovelace',
  grade: 'Grade 6',
  schoolName: 'Olympiad Preparatory School',
  phone: '+49 30 123456',
  createdAt: '2026-10-21T08:51:22.670375Z',
  updatedAt: '2026-10-21T08:51:22.670375Z',
}

/** An active enrollment of the signed-in student. */
export const ACTIVE_ENROLLMENT: Enrollment = {
  id: 11,
  identityUserId: TEST_PROFILE.id,
  studentProfileId: STUDENT_PROFILE.id,
  courseId: PUBLISHED_COURSE.id,
  status: 'ACTIVE',
  createdAt: '2026-10-21T09:00:00Z',
  updatedAt: '2026-10-21T09:00:00Z',
}

/** A cancelled enrollment of the signed-in student. */
export const CANCELLED_ENROLLMENT: Enrollment = {
  ...ACTIVE_ENROLLMENT,
  id: 12,
  courseId: DRAFT_COURSE.id,
  status: 'CANCELLED',
}

export function createAuthResponse(
  overrides: Partial<AuthResponse> = {},
): AuthResponse {
  return {
    accessToken: TEST_TOKEN,
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: TEST_PROFILE,
    ...overrides,
  }
}

export function createFakeAuthApi(
  overrides: Partial<MockedAuthApi> = {},
): MockedAuthApi {
  return {
    register: vi.fn(async () => createAuthResponse()),
    login: vi.fn(async () => createAuthResponse()),
    me: vi.fn(async () => TEST_PROFILE),
    permissions: vi.fn(async () => STUDENT_AUTHORITIES),
    ...overrides,
  }
}

/** Simulates a browser that already holds a valid token for the session. */
export function seedSession(token: string = TEST_TOKEN): void {
  setSession({
    accessToken: token,
    tokenType: 'Bearer',
    expiresAt: Date.now() + 60 * 60 * 1000,
  })
}

export interface RenderAppOptions {
  api?: MockedAuthApi
  route?: string
  /** Initial theme preference, defaults to "system". */
  theme?: 'light' | 'dark' | 'system'
}

/** Renders the full routed application with an injectable auth API. */
export function renderApp(options: RenderAppOptions = {}) {
  const api = options.api ?? createFakeAuthApi()
  const route = options.route ?? '/'
  const result = render(
    <ThemeProvider initialPreference={options.theme}>
      <AuthProvider api={api}>
        <ToastProvider>
          <MemoryRouter initialEntries={[route]}>
            <AppRoutes />
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  )
  return { ...result, api }
}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderAppOptions = {},
) {
  const api = options.api ?? createFakeAuthApi()
  const route = options.route ?? '/'
  const result = render(
    <ThemeProvider initialPreference={options.theme}>
      <AuthProvider api={api}>
        <ToastProvider>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>,
  )
  return { ...result, api }
}
