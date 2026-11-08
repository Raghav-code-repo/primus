import { useCallback, useMemo, useState } from 'react'

import { ApiError } from '../api/errors'
import { studentApi } from '../api/studentApi'
import { useAsyncResource } from './useAsyncResource'
import type {
  StudentProfile,
  StudentProfileRequest,
  StudentUpdateRequest,
} from '../types/student'

/**
 * State of the student profile.
 *
 * `missing` is a distinct state because the backend answers with 404 when the
 * signed-in student has no profile yet - that is not an error but a situation
 * the page has to offer a creation flow for.
 */
export type StudentProfileState =
  | { status: 'loading' }
  | { status: 'ready'; profile: StudentProfile }
  | { status: 'missing' }
  | { status: 'error'; message: string }

export interface UseStudentProfileResult {
  state: StudentProfileState
  /** True while a create or update request is running. */
  saving: boolean
  /** Message of the last failed create or update request. */
  saveError: string | null
  /** Reloads the profile from the Student Service. */
  reload: () => void
  /** Creates the profile of the signed-in student. */
  create: (payload: StudentProfileRequest) => Promise<boolean>
  /** Updates the profile of the signed-in student. */
  update: (payload: StudentUpdateRequest) => Promise<boolean>
  /** Clears the message of the last failed save. */
  clearSaveError: () => void
}

/**
 * Loads the profile of the signed-in student from `GET /api/students/me` and
 * exposes the create and update operations.
 *
 * The identity of the profile is never part of the request: the Student
 * Service derives it from the validated JWT.
 */
export function useStudentProfile(): UseStudentProfileResult {
  const loader = useCallback(() => studentApi.getMyProfile(), [])
  const resource = useAsyncResource<StudentProfile>(
    loader,
    'me',
    'The student profile could not be loaded from the Student Service.',
  )

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedProfile, setSavedProfile] = useState<StudentProfile | null>(null)

  const state = useMemo<StudentProfileState>(() => {
    if (savedProfile) {
      return { status: 'ready', profile: savedProfile }
    }
    if (resource.loading) {
      return { status: 'loading' }
    }
    if (resource.errorStatus === 404) {
      // The backend answered 404 because the signed-in student has no profile
      // yet. That is not an error but a state the page can offer a form for.
      return { status: 'missing' }
    }
    if (resource.error) {
      return { status: 'error', message: resource.error }
    }
    if (resource.data) {
      return { status: 'ready', profile: resource.data }
    }
    return { status: 'missing' }
  }, [
    resource.data,
    resource.error,
    resource.errorStatus,
    resource.loading,
    savedProfile,
  ])

  const reload = useCallback(() => {
    setSavedProfile(null)
    resource.reload()
  }, [resource])

  const save = useCallback(
    async (
      payload: StudentProfileRequest,
      operation: (body: StudentProfileRequest) => Promise<StudentProfile>,
    ): Promise<boolean> => {
      setSaving(true)
      setSaveError(null)
      try {
        const profile = await operation(payload)
        setSavedProfile(profile)
        return true
      } catch (error) {
        setSaveError(
          error instanceof ApiError
            ? error.message
            : 'The student profile could not be saved.',
        )
        return false
      } finally {
        setSaving(false)
      }
    },
    [],
  )

  const create = useCallback(
    (payload: StudentProfileRequest) => save(payload, studentApi.createMyProfile),
    [save],
  )

  const update = useCallback(
    (payload: StudentUpdateRequest) => save(payload, studentApi.updateMyProfile),
    [save],
  )

  const clearSaveError = useCallback(() => {
    setSaveError(null)
  }, [])

  return useMemo(
    () => ({
      state,
      saving,
      saveError,
      reload,
      create,
      update,
      clearSaveError,
    }),
    [state, saving, saveError, reload, create, update, clearSaveError],
  )
}
