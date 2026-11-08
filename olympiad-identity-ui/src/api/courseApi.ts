import { courseClient } from './client'
import type { Course, CoursePage, CourseQuery, CourseRequest } from '../types/course'

/**
 * Endpoints of `CourseController` (com.olympiad.course.controller.CourseController).
 * All paths are relative to the Course Service base URL.
 *
 * The Course Service is a stateless OAuth2 resource server: every request
 * needs the same bearer token that the Identity Service issued. The token is
 * attached by the shared request interceptor of the HTTP client, never by this
 * module.
 */
export interface CourseApi {
  /** GET /api/courses - requires the authority COURSE_READ. */
  list(query?: CourseQuery): Promise<CoursePage>
  /** GET /api/courses/{id} - requires the authority COURSE_READ. */
  get(id: string): Promise<Course>
  /** POST /api/courses - requires the authority COURSE_CREATE. */
  create(payload: CourseRequest): Promise<Course>
  /** PUT /api/courses/{id} - requires the authority COURSE_UPDATE. */
  update(id: string, payload: CourseRequest): Promise<Course>
  /** DELETE /api/courses/{id} - requires the authority COURSE_DELETE. */
  remove(id: string): Promise<void>
}

export const courseApi: CourseApi = {
  async list(query: CourseQuery = {}): Promise<CoursePage> {
    const params: Record<string, string | number> = {}

    if (query.status) {
      params.status = query.status
    }
    if (query.subject?.trim()) {
      params.subject = query.subject.trim()
    }
    if (typeof query.page === 'number' && query.page >= 0) {
      params.page = query.page
    }
    if (typeof query.size === 'number' && query.size > 0) {
      params.size = query.size
    }

    const response = await courseClient.get<CoursePage>('/api/courses', {
      params,
    })
    return response.data
  },

  async get(id: string): Promise<Course> {
    const response = await courseClient.get<Course>(`/api/courses/${id}`)
    return response.data
  },

  async create(payload: CourseRequest): Promise<Course> {
    const response = await courseClient.post<Course>('/api/courses', payload)
    return response.data
  },

  async update(id: string, payload: CourseRequest): Promise<Course> {
    const response = await courseClient.put<Course>(
      `/api/courses/${id}`,
      payload,
    )
    return response.data
  },

  async remove(id: string): Promise<void> {
    await courseClient.delete(`/api/courses/${id}`)
  },
}
