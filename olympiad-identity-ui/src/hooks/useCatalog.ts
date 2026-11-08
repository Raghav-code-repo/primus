import { useCallback, useMemo, useState } from 'react'

import { catalogApi } from '../api/catalogApi'
import { enrollmentApi } from '../api/enrollmentApi'
import { useAsyncResource } from './useAsyncResource'
import type { CatalogPage } from '../types/course'

export interface UseCatalogResult {
  courses: CatalogPage['content']
  totalElements: number
  totalPages: number
  loading: boolean
  error: string | null
  /** Reloads the catalogue from the Student Service. */
  reload: () => void
}

/**
 * Loads a page of the student facing course catalogue.
 *
 * The catalogue of the Student Service only returns published courses by
 * default, so no status filter is sent: the backend decides what a student
 * may see.
 */
export function useCatalog(query: {
  subject?: string
  page?: number
  size?: number
}): UseCatalogResult {
  const { subject, page: pageNumber, size } = query

  const loader = useCallback(
    () => catalogApi.list({ subject, page: pageNumber, size }),
    [pageNumber, size, subject],
  )

  const resource = useAsyncResource<CatalogPage>(
    loader,
    `${subject ?? ''}|${pageNumber ?? 0}|${size ?? 0}`,
    'The course catalogue could not be loaded from the Student Service.',
  )

  return {
    courses: resource.data?.content ?? [],
    totalElements: resource.data?.totalElements ?? 0,
    totalPages: resource.data?.totalPages ?? 0,
    loading: resource.loading,
    error: resource.error,
    reload: resource.reload,
  }
}

/**
 * The identities of the courses the signed-in student is enrolled in. The
 * catalogue of the Student Service is the only supported source, so the
 * enrollment state of the catalogue is read from the enrollment endpoint.
 */
export function useEnrolledCourseIds(): {
  enrolledCourseIds: Set<string>
  loading: boolean
  reload: () => void
  /** Adds a course to the enrolled set after a successful enrollment. */
  markEnrolled: (courseId: string) => void
} {
  const loader = useCallback(() => enrollmentApi.listMine(), [])

  const resource = useAsyncResource(
    loader,
    'enrolled',
    'Your enrollments could not be loaded from the Student Service.',
  )

  const [localEnrollments, setLocalEnrollments] = useState<string[]>([])

  const markEnrolled = useCallback((courseId: string) => {
    setLocalEnrollments((current) =>
      current.includes(courseId) ? current : [...current, courseId],
    )
  }, [])

  const enrolledCourseIds = useMemo(() => {
    const enrollments = resource.data ?? []
    return new Set([
      ...localEnrollments,
      ...enrollments
        .filter((item) => item.status === 'ACTIVE')
        .map((item) => item.courseId),
    ])
  }, [localEnrollments, resource.data])

  return {
    enrolledCourseIds,
    loading: resource.loading,
    reload: resource.reload,
    markEnrolled,
  }
}
