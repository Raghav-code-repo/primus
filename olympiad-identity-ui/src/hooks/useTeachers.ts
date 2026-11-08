import { useCallback, useEffect, useMemo, useState } from 'react'

import { adminApi } from '../api/adminApi'
import { ApiError } from '../api/errors'
import { isTeacher } from '../auth/roles'

export interface UseTeachersResult {
  teachers: TeacherOption[]
  loading: boolean
  error: string | null
  /** Reloads the teacher list from the Identity Service. */
  reload: () => void
}

export interface TeacherOption {
  value: string
  label: string
  email: string
}

/**
 * Loads the accounts that hold the TEACHER role so an administrator can assign
 * a teacher when creating a live class.
 *
 * The Identity Service returns every account through GET /api/admin/users and
 * marks each account with its roles, so the client filters for TEACHER here.
 * Listing users requires the backend permission that the administrator's role
 * maps to; the frontend only decides what to show.
 *
 * Loading state is derived from the request key the current result belongs to,
 * following the same pattern as {@link useCourseList}, so no state is set
 * synchronously inside the effect.
 */
export function useTeachers(): UseTeachersResult {
  const [reloadToken, setReloadToken] = useState(0)
  const [state, setState] = useState<{
    key: string
    teachers: TeacherOption[]
    error: string | null
  }>({ key: '', teachers: [], error: null })

  const requestKey = String(reloadToken)

  useEffect(() => {
    let active = true

    adminApi
      .listUsers()
      .then((users) => {
        if (!active) {
          return
        }
        const teachers = users
          .filter((user) => isTeacher(user.roles))
          .map((user) => ({
            value: user.id,
            label: `${user.firstName} ${user.lastName}`.trim() || user.email,
            email: user.email,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
        setState({ key: requestKey, teachers, error: null })
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }
        setState({
          key: requestKey,
          teachers: [],
          error:
            error instanceof ApiError
              ? error.message
              : 'The teachers could not be loaded from the Identity Service.',
        })
      })

    return () => {
      active = false
    }
  }, [requestKey])

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  const teachers = useMemo(() => state.teachers, [state.teachers])

  return {
    teachers,
    loading: state.key !== requestKey,
    error: state.error,
    reload,
  }
}
