import { useCallback, useEffect, useMemo, useState } from 'react'

import { courseApi } from '../api/courseApi'
import { ApiError } from '../api/errors'
import type { Course, CoursePage, CourseQuery } from '../types/course'

export interface UseCourseListResult {
  courses: Course[]
  page: CoursePage | null
  loading: boolean
  error: string | null
  /** Reloads the list from the Course Service. */
  reload: () => void
}

interface ListState {
  /** The query the current result belongs to. */
  key: string
  page: CoursePage | null
  error: string | null
}

/**
 * Loads a page of courses from the Course Service and keeps the loading, empty
 * and error state of the list in one place, so every list view behaves the
 * same way.
 *
 * The loading state is derived from the query the current result belongs to,
 * so a new request is visible immediately without setting state inside the
 * effect.
 */
export function useCourseList(query: CourseQuery): UseCourseListResult {
  const { status, subject, page: pageNumber, size } = query

  const queryKey = `${status ?? ''}|${subject ?? ''}|${pageNumber ?? 0}|${
    size ?? 0
  }`

  const [reloadToken, setReloadToken] = useState(0)
  const [state, setState] = useState<ListState>({
    key: '',
    page: null,
    error: null,
  })

  const requestKey = `${queryKey}#${reloadToken}`

  useEffect(() => {
    let active = true

    courseApi
      .list({ status, subject, page: pageNumber, size })
      .then((result) => {
        if (!active) {
          return
        }
        setState({ key: requestKey, page: result, error: null })
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }
        setState({
          key: requestKey,
          page: null,
          error:
            error instanceof ApiError
              ? error.message
              : 'The courses could not be loaded from the Course Service.',
        })
      })

    return () => {
      active = false
    }
  }, [requestKey, status, subject, pageNumber, size])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const loading = useMemo(
    () => state.key !== requestKey,
    [state.key, requestKey],
  )

  return {
    courses: state.page?.content ?? [],
    page: state.page,
    loading,
    error: state.error,
    reload,
  }
}
