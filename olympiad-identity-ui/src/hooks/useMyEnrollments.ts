import { useCallback, useMemo, useState } from 'react'

import { ApiError } from '../api/errors'
import { catalogApi } from '../api/catalogApi'
import { enrollmentApi } from '../api/enrollmentApi'
import { useAsyncResource } from './useAsyncResource'
import type { CatalogCourse } from '../types/course'
import type { Enrollment } from '../types/student'

/**
 * The enrollments of the signed-in student together with the course titles.
 *
 * The enrollment records of the Student Service only carry the course id. The
 * titles are read from the course catalogue of the Student Service with a
 * single request, so the page does not produce one request per enrollment.
 */
export interface UseMyEnrollmentsResult {
  enrollments: Enrollment[]
  /** The catalogue courses, indexed by their id. */
  courses: Map<string, CatalogCourse>
  loading: boolean
  error: string | null
  /** True while an enrollment request is running. */
  submitting: boolean
  /** Message of the last failed enrollment request. */
  submitError: string | null
  /** Reloads the enrollments and the course titles. */
  reload: () => void
  /** Enrolls the signed-in student in a course. */
  enroll: (courseId: string) => Promise<boolean>
  /** Cancels one of the enrollments of the signed-in student. */
  cancel: (enrollmentId: number) => Promise<boolean>
  /** Clears the message of the last failed enrollment request. */
  clearSubmitError: () => void
}

const CATALOG_PAGE_SIZE = 100

export function useMyEnrollments(): UseMyEnrollmentsResult {
  const enrollmentLoader = useCallback(() => enrollmentApi.listMine(), [])
  const catalogLoader = useCallback(
    () => catalogApi.list({ page: 0, size: CATALOG_PAGE_SIZE }),
    [],
  )

  const enrollmentsResource = useAsyncResource<Enrollment[]>(
    enrollmentLoader,
    'mine',
    'The enrollments could not be loaded from the Student Service.',
  )
  const catalogResource = useAsyncResource(
    catalogLoader,
    'catalogue',
    'The course catalogue could not be loaded from the Student Service.',
  )

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [localEnrollments, setLocalEnrollments] = useState<Enrollment[] | null>(
    null,
  )

  const enrollments = useMemo(
    () => localEnrollments ?? enrollmentsResource.data ?? [],
    [enrollmentsResource.data, localEnrollments],
  )

  const courses = useMemo(
    () =>
      new Map(
        (catalogResource.data?.content ?? []).map((course) => [
          course.id,
          course,
        ]),
      ),
    [catalogResource.data],
  )

  const reload = useCallback(() => {
    setLocalEnrollments(null)
    enrollmentsResource.reload()
    catalogResource.reload()
  }, [catalogResource, enrollmentsResource])

  const enroll = useCallback(async (courseId: string): Promise<boolean> => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const enrollment = await enrollmentApi.create({ courseId })
      setLocalEnrollments((current) => {
        const base = current ?? []
        const withoutDuplicate = base.filter(
          (item) => item.courseId !== enrollment.courseId,
        )
        return [enrollment, ...withoutDuplicate]
      })
      return true
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : 'The enrollment could not be created.',
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }, [])

  const cancel = useCallback(
    async (enrollmentId: number): Promise<boolean> => {
      setSubmitting(true)
      setSubmitError(null)
      try {
        await enrollmentApi.cancel(enrollmentId)
        setLocalEnrollments(
          enrollments.map((item) =>
            item.id === enrollmentId ? { ...item, status: 'CANCELLED' } : item,
          ),
        )
        return true
      } catch (error) {
        setSubmitError(
          error instanceof ApiError
            ? error.message
            : 'The enrollment could not be cancelled.',
        )
        return false
      } finally {
        setSubmitting(false)
      }
    },
    [enrollments],
  )

  const clearSubmitError = useCallback(() => {
    setSubmitError(null)
  }, [])

  return useMemo(
    () => ({
      enrollments,
      courses,
      loading: enrollmentsResource.loading,
      error: enrollmentsResource.error,
      submitting,
      submitError,
      reload,
      enroll,
      cancel,
      clearSubmitError,
    }),
    [
      enrollments,
      courses,
      enrollmentsResource.loading,
      enrollmentsResource.error,
      submitting,
      submitError,
      reload,
      enroll,
      cancel,
      clearSubmitError,
    ],
  )
}
