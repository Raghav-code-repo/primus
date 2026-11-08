/**
 * Types mirroring the Course Service DTOs.
 * Source of truth: com.olympiad.course.dto.CourseRequest,
 * com.olympiad.course.dto.CourseResponse, com.olympiad.course.entity.CourseStatus
 * and the Spring Data `Page` wrapper returned by GET /api/courses.
 */

/** `CourseStatus` - the lifecycle of a course. */
export const COURSE_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const

export type CourseStatus = (typeof COURSE_STATUSES)[number]

/** `CourseRequest` - body of POST /api/courses and PUT /api/courses/{id}. */
export interface CourseRequest {
  code: string
  title: string
  description?: string
  subject: string
  gradeLevel: string
  status: CourseStatus
}

/** `CourseResponse` - returned by every course endpoint. */
export interface Course {
  id: string
  code: string
  title: string
  description: string | null
  subject: string
  gradeLevel: string
  status: CourseStatus
  createdAt: string
  updatedAt: string
}

/**
 * The Spring Data page wrapper returned by GET /api/courses. Only the fields
 * the interface actually uses are modelled.
 */
export interface CoursePage {
  content: Course[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

/** Query parameters accepted by GET /api/courses. */
export interface CourseQuery {
  status?: CourseStatus | ''
  subject?: string
  page?: number
  size?: number
}

export function isCourseStatus(value: unknown): value is CourseStatus {
  return (
    typeof value === 'string' &&
    (COURSE_STATUSES as readonly string[]).includes(value)
  )
}

/**
 * `CourseSummaryResponse` - the projection the Student Service returns for the
 * course catalogue (`com.olympiad.student.dto.CourseSummaryResponse`).
 *
 * It mirrors the Course Service `CourseResponse`, but the status is a plain
 * string here, so the value is checked before it is treated as a known
 * {@link CourseStatus}.
 */
export interface CatalogCourse {
  id: string
  code: string
  title: string
  description: string | null
  subject: string
  gradeLevel: string
  status: string
  createdAt: string | null
  updatedAt: string | null
}

/**
 * `CoursePageResponse` - the page wrapper of the Student Service catalogue
 * (`com.olympiad.student.dto.CoursePageResponse`).
 *
 * The field names differ from the Spring Data page of the Course Service, so
 * the two responses are modelled separately.
 */
export interface CatalogPage {
  content: CatalogCourse[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/** Query parameters accepted by GET /api/courses of the Student Service. */
export interface CatalogQuery {
  subject?: string
  page?: number
  size?: number
}

