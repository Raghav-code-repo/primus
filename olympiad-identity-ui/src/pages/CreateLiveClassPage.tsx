import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Alert } from '../components/Alert'
import { FormField } from '../components/FormField'
import {
  createLiveClass,
  updateLiveClass,
  cancelLiveClass,
  getLiveClass,
  type CreateLiveClassRequest,
  type LiveClass,
} from '../api/liveClassApi'
import { ApiError } from '../api/errors'
import { useAuth } from '../auth/useAuth'
import { hasRole } from '../auth/roles'
import { useCourseList } from '../hooks/useCourseList'
import { useTeachers } from '../hooks/useTeachers'
import { useToast } from '../hooks/useToast'
import { liveClassSchema, type LiveClassFormValues } from '../validation/liveClassSchemas'
import type { CourseQuery } from '../types/course'

/**
 * Create (and edit) a live class.
 *
 * Teachers create classes for themselves; the teacher identity is derived
 * from the authenticated principal and is not sent to the backend.
 * Administrators select a teacher from the Identity Service and submit the
 * teacher's user ID.
 *
 * Route: /live-classes/create  (create)
 *        /live-classes/:id/edit (edit)
 */
export function CreateLiveClassPage() {
  const { roles, hasPermission } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { id } = useParams<{ id: string }>()

  const isEdit = Boolean(id)
  const isAdmin = hasRole(roles, 'ADMIN')
  const canCreate = hasPermission('LIVE_CLASS_CREATE')

  const [formError, setFormError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(isEdit)

  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
  } = useCourseList({ size: 100 } as CourseQuery)

  const {
    teachers,
    loading: teachersLoading,
    error: teachersError,
  } = useTeachers()

  // Teachers are only relevant for administrators. A teacher creating their own
  // class derives the teacher identity from the authenticated principal, so the
  // teacher list must neither block the form nor be shown.
  const relevantTeachers = useMemo(
    () => (isAdmin ? teachers : []),
    [isAdmin, teachers],
  )
  const relevantTeachersLoading = isAdmin ? teachersLoading : false
  const relevantTeachersError = isAdmin ? teachersError : null

  const {
    register,
    handleSubmit,
    reset,
    setError: setFieldError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LiveClassFormValues>({
    resolver: zodResolver(liveClassSchema),
    defaultValues: {
      title: '',
      description: '',
      courseId: '',
      teacherId: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
    },
  })

  const courseOptions = useMemo(
    () =>
      courses.map((course) => ({
        value: course.id,
        label: `${course.title} (${course.code}) — ${course.subject} · ${
          course.gradeLevel
        }`,
      })),
    [courses],
  )

  const teacherOptions = useMemo(
    () =>
      relevantTeachers.map((teacher) => ({
        value: teacher.value,
        label: `${teacher.label} — ${teacher.email}`,
      })),
    [relevantTeachers],
  )

  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  )

  const localParts = useCallback(
    (utcIso: string): { date: string; time: string } => {
      const date = new Date(utcIso)
      return {
        date: date.toLocaleDateString('sv-SE'),
        time: date.toLocaleTimeString('sv-SE', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      }
    },
    [],
  )

  const toUtcIso = useCallback(
    (date: string, time: string): string => {
      const dateParts = date.split('-').map((part) => Number(part))
      const timeParts = time.split(':').map((part) => Number(part))
      const year = dateParts[0]!
      const month = dateParts[1]!
      const day = dateParts[2]!
      const hours = timeParts[0]!
      const minutes = timeParts[1]!
      const local = new Date(year, month - 1, day, hours, minutes, 0, 0)
      return local.toISOString()
    },
    [],
  )

  // Load an existing class into the form when editing.
  useEffect(() => {
    if (!isEdit || !id) {
      return
    }
    let active = true

    setEditLoading(true)
    setEditError(null)

    getLiveClass(id)
      .then((liveClass: LiveClass) => {
        if (!active) {
          return
        }
        const start = localParts(liveClass.scheduledStart)
        const end = localParts(liveClass.scheduledEnd)

        reset({
          title: liveClass.title,
          description: liveClass.description ?? '',
          courseId: liveClass.courseId,
          teacherId: isAdmin ? liveClass.teacherId : '',
          startDate: start.date,
          startTime: start.time,
          endDate: end.date,
          endTime: end.time,
        })
        setEditLoading(false)
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }
        setEditError(
          error instanceof ApiError
            ? error.message
            : 'The live class could not be loaded.',
        )
        setEditLoading(false)
      })

    return () => {
      active = false
    }
  }, [isEdit, id, reset, isAdmin, localParts])

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    clearErrors()

    if (isAdmin && !values.teacherId) {
      setFieldError('teacherId', {
        type: 'manual',
        message: 'Select a teacher',
      })
      return
    }

    const scheduledStart = toUtcIso(values.startDate, values.startTime)
    const scheduledEnd = toUtcIso(values.endDate, values.endTime)

    const trimmedDescription = values.description?.trim()
    const description =
      trimmedDescription && trimmedDescription.length > 0
        ? trimmedDescription
        : undefined

    const request: Record<string, unknown> = {
      courseId: values.courseId,
      title: values.title,
      description,
      scheduledStart,
      scheduledEnd,
    }

    if (isAdmin) {
      request.teacherId = values.teacherId
    }

    try {
      if (isEdit && id) {
        await updateLiveClass(id, {
          title: values.title,
          description,
          scheduledStart,
          scheduledEnd,
        })
        toast({
          variant: 'success',
          title: 'Live class updated',
          description: `The session “${values.title}” was saved.`,
          duration: 4000,
        })
        navigate('/live-classes', { replace: true })
        return
      }

      const created = await createLiveClass(
        request as unknown as CreateLiveClassRequest,
      )

      toast({
        variant: 'success',
        title: 'Live class created',
        description: `“${created.title}” is scheduled for ${formatDateTime(
          created.scheduledStart,
        )} to ${formatDateTime(created.scheduledEnd)}.`,
        duration: 5000,
      })
      navigate('/live-classes', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldNames = Object.keys(error.fieldErrors)
        if (fieldNames.length > 0) {
          fieldNames.forEach((field) => {
            setFieldError(field as keyof LiveClassFormValues, {
              type: 'server',
              message: error.fieldErrors[field],
            })
          })
          return
        }
        setFormError(error.message)
        return
      }
      setFormError('The live class could not be saved. Please try again.')
    }
  })

  const handleCancel = () => {
    navigate('/live-classes', { replace: true })
  }

  const handleDelete = async () => {
    if (!isEdit || !id) {
      return
    }
    if (!window.confirm('Cancel this live class?')) {
      return
    }
    try {
      await cancelLiveClass(id)
      toast({
        variant: 'success',
        title: 'Live class cancelled',
        description: 'The session has been cancelled.',
        duration: 4000,
      })
      navigate('/live-classes', { replace: true })
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'The live class could not be cancelled.',
      )
    }
  }

  const isLoading = editLoading || coursesLoading || relevantTeachersLoading

  const canManage = isEdit
    ? hasPermission('LIVE_CLASS_UPDATE')
    : canCreate

  if (!canCreate && !isEdit) {
    return (
      <div className="page">
        <Alert variant="error" title="Not authorized">
          You do not have permission to create live classes.
        </Alert>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="page__eyebrow">Live Class Service</p>
          <h1 className="page__title">
            {isEdit ? 'Edit live class' : 'Create live class'}
          </h1>
          <p className="page__title--sub">
            Schedule and manage interactive online learning sessions.
          </p>
        </div>
        <BackLink />
      </header>

      {formError ? (
        <Alert variant="error" title="The live class could not be saved">
          {formError}
        </Alert>
      ) : null}

      {editError ? (
        <Alert variant="error" title="The live class could not be loaded">
          {editError}
        </Alert>
      ) : null}

      {coursesError ? (
        <Alert variant="error" title="Courses could not be loaded">
          {coursesError}
        </Alert>
      ) : null}

      {relevantTeachersError ? (
        <Alert variant="error" title="Teachers could not be loaded">
          {relevantTeachersError}
        </Alert>
      ) : null}

      {!isLoading && (coursesError === null || courses.length > 0) && (
        <section className="card" aria-labelledby="live-class-form-heading">
          <h2 className="card__title" id="live-class-form-heading">
            {isEdit ? 'Change the live class' : 'Live class details'}
          </h2>
          <p className="card__text">
            The Live Class Service validates the same fields and rejects the
            request with HTTP 400 when one of them is missing.
          </p>

          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="form-grid">
              <FormField
                id="title"
                label="Live class title"
                error={errors.title?.message}
                hint="At most 150 characters."
                required
              >
                {(fieldProps) => (
                  <input
                    {...fieldProps}
                    {...register('title')}
                    className="form-input"
                    type="text"
                    placeholder="Olympiad Mathematics - Live Session"
                    disabled={isLoading}
                  />
                )}
              </FormField>

              <FormField
                id="description"
                label="Description"
                error={errors.description?.message}
                hint="Optional, at most 2000 characters."
              >
                {(fieldProps) => (
                  <textarea
                    {...fieldProps}
                    {...register('description')}
                    className="form-input"
                    rows={4}
                    placeholder="Advanced problem-solving practice"
                    disabled={isLoading}
                  />
                )}
              </FormField>

              <FormField
                id="courseId"
                label="Course"
                error={errors.courseId?.message}
                hint="Select the course this session belongs to."
                required
              >
                {(fieldProps) => (
                  <select
                    {...fieldProps}
                    {...register('courseId')}
                    className="form-input"
                    disabled={isLoading || coursesLoading}
                  >
                    <option value="">Select a course</option>
                    {coursesLoading ? (
                      <option disabled>
                        Loading courses…
                      </option>
                    ) : courseOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>

              {isAdmin ? (
                <FormField
                  id="teacherId"
                  label="Teacher"
                  error={errors.teacherId?.message}
                  hint="Select the teacher who will run this session."
                  required
                >
                  {(fieldProps) => (
                    <select
                      {...fieldProps}
                      {...register('teacherId')}
                      className="form-input"
                      disabled={isLoading || relevantTeachersLoading}
                    >
                      <option value="">Select a teacher</option>
                      {relevantTeachersLoading ? (
                        <option disabled>
                          Loading teachers…
                        </option>
                      ) : teacherOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </FormField>
              ) : null}
            </div>

            <section className="card" style={{ marginTop: 'var(--space-5)' }}>
              <h2 className="card__title">Schedule</h2>
              <p className="card__text">
                Pick the start and end of the session. Times are shown in your
                local time zone ({timezone}) and converted to UTC before they
                are sent to the Live Class Service.
              </p>
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-field__label" htmlFor="startDate">
                    Scheduled start date
                  </label>
                  <input
                    id="startDate"
                    {...register('startDate')}
                    className="form-input"
                    type="date"
                    disabled={isLoading}
                  />
                  {errors.startDate && (
                    <p className="form-field__error" role="alert">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
                <div className="form-field">
                  <label className="form-field__label" htmlFor="startTime">
                    Start time
                  </label>
                  <input
                    id="startTime"
                    {...register('startTime')}
                    className="form-input"
                    type="time"
                    disabled={isLoading}
                  />
                  {errors.startTime && (
                    <p className="form-field__error" role="alert">
                      {errors.startTime.message}
                    </p>
                  )}
                </div>
                <div className="form-field">
                  <label className="form-field__label" htmlFor="endDate">
                    Scheduled end date
                  </label>
                  <input
                    id="endDate"
                    {...register('endDate')}
                    className="form-input"
                    type="date"
                    disabled={isLoading}
                  />
                  {errors.endDate && (
                    <p className="form-field__error" role="alert">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
                <div className="form-field">
                  <label className="form-field__label" htmlFor="endTime">
                    End time
                  </label>
                  <input
                    id="endTime"
                    {...register('endTime')}
                    className="form-input"
                    type="time"
                    disabled={isLoading}
                  />
                  {errors.endTime && (
                    <p className="form-field__error" role="alert">
                      {errors.endTime.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="card" style={{ marginTop: 'var(--space-5)' }}>
              <h2 className="card__title">Session details</h2>
              <p className="card__text">
                A LiveKit room is associated with the session by the backend.
                You do not need to enter a room name. A LiveKit token is only
                generated when an authorized participant joins the session.
              </p>
            </section>

            <div className="card__actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={handleCancel}
                disabled={isSubmitting || isLoading}
              >
                Cancel
              </button>
              {isEdit && isAdmin && hasPermission('LIVE_CLASS_CANCEL') ? (
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={handleDelete}
                  disabled={isSubmitting || isLoading}
                >
                  Cancel class
                </button>
              ) : null}
              <button
                className="button button--primary"
                type="submit"
                disabled={isSubmitting || isLoading || !canManage}
              >
                {isSubmitting
                  ? 'Saving…'
                  : isEdit
                    ? 'Update live class'
                    : 'Create live class'}
              </button>
            </div>
          </form>
        </section>
      )}

      {isLoading && !coursesError && !relevantTeachersError && (
        <section className="card">
          <p className="card__text" role="status">Loading…</p>
        </section>
      )}
    </div>
  )
}

function BackLink() {
  const navigate = useNavigate()
  return (
    <a
      href="/live-classes"
      className="button button--ghost"
      onClick={(event) => {
        event.preventDefault()
        navigate('/live-classes')
      }}
    >
      Back to live classes
    </a>
  )
}

function formatDateTime(utcIso: string): string {
  return new Date(utcIso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export type { LiveClassFormValues }
