import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Alert } from '../components/Alert'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { FormField } from '../components/FormField'
import { Skeleton } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import { useStudentProfile } from '../hooks/useStudentProfile'
import {
  studentProfileSchema,
  type StudentProfileFormValues,
} from '../validation/studentSchemas'
import type { StudentProfile } from '../types/student'

const EMPTY_VALUES: StudentProfileFormValues = {
  fullName: '',
  grade: '',
  schoolName: '',
  phone: '',
}

/**
 * The student profile of the signed-in student.
 *
 * The profile is read from `GET /api/students/me` and written with
 * `PUT /api/students/me`. The identity of the profile is never part of a
 * request: the Student Service derives it from the validated JWT, so the
 * browser cannot read or change the profile of another student.
 */
export function StudentProfilePage() {
  const { state, saving, saveError, reload, create, update, clearSaveError } =
    useStudentProfile()

  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [creating, setCreating] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (state.status === 'ready') {
      reset(toFormValues(state.profile))
    }
  }, [reset, state])

  const onSubmit = handleSubmit(async (values) => {
    setSaved(false)
    clearSaveError()

    const payload = {
      fullName: values.fullName.trim(),
      grade: values.grade.trim(),
      schoolName: values.schoolName.trim(),
      phone: values.phone.trim(),
    }

    const succeeded = editing
      ? await update(payload)
      : await create(payload)

    if (succeeded) {
      setSaved(true)
      setEditing(false)
      setCreating(false)
    }
  })

  const startEditing = () => {
    clearSaveError()
    setSaved(false)
    setEditing(true)
  }

  const startCreating = () => {
    clearSaveError()
    setSaved(false)
    setCreating(true)
    reset(EMPTY_VALUES)
  }

  const cancelEditing = () => {
    clearSaveError()
    setSaved(false)
    setEditing(false)
    setCreating(false)
    if (state.status === 'ready') {
      reset(toFormValues(state.profile))
    }
  }

  if (state.status === 'loading') {
    return (
      <div className="page">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'My Profile' },
          ]}
        />
        <header className="page__header">
          <div>
            <p className="page__eyebrow">Student profile</p>
            <h1 className="page__title">Your student profile</h1>
          </div>
        </header>
        <section className="card">
          <Skeleton lines={6} label="Loading your student profile" />
        </section>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="page">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'My Profile' },
          ]}
        />
        <header className="page__header">
          <div>
            <p className="page__eyebrow">Student profile</p>
            <h1 className="page__title">Your student profile</h1>
          </div>
          <button
            className="button button--secondary"
            type="button"
            onClick={reload}
          >
            Try again
          </button>
        </header>
        <Alert variant="error" title="The profile could not be loaded">
          {state.message}
        </Alert>
      </div>
    )
  }

  if (state.status === 'missing') {
    return (
      <div className="page">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'My Profile' },
          ]}
        />
        <header className="page__header">
          <div>
            <p className="page__eyebrow">Student profile</p>
            <h1 className="page__title">Your student profile</h1>
          </div>
        </header>

        <EmptyState
          title="No student profile yet"
          description={
            <>
              <p>
                The Student Service has no profile for your account yet. Create
                one to complete your registration - the profile is linked to
                your identity by the backend, not by the form.
              </p>
              <p>
                A profile can only be created once. A second attempt is
                rejected by the backend with HTTP 409.
              </p>
            </>
          }
        />

        {saveError ? (
          <Alert variant="error" title="The profile could not be created">
            {saveError}
          </Alert>
        ) : null}

        {creating ? (
          <StudentProfileForm
            errors={errors}
            isSubmitting={isSubmitting || saving}
            register={register}
            onSubmit={onSubmit}
            onCancel={cancelEditing}
            submitLabel="Create profile"
          />
        ) : (
          <div className="card__actions">
            <button
              className="button button--primary"
              type="button"
              onClick={startCreating}
            >
              Create your profile
            </button>
          </div>
        )}
      </div>
    )
  }

  const profile = state.profile
  const isFormOpen = editing || creating

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'My Profile' },
        ]}
      />

      <header className="page__header">
        <div>
          <p className="page__eyebrow">Student profile</p>
          <h1 className="page__title">Your student profile</h1>
        </div>
        <div className="card__actions">
          {!isFormOpen ? (
            <button
              className="button button--primary"
              type="button"
              onClick={startEditing}
            >
              Edit profile
            </button>
          ) : null}
          <button
            className="button button--secondary"
            type="button"
            onClick={reload}
            disabled={saving}
          >
            Refresh
          </button>
        </div>
      </header>

      {saved ? (
        <Alert variant="success" title="Profile saved">
          Your student profile was saved and reloaded from the Student Service.
        </Alert>
      ) : null}

      {saveError ? (
        <Alert variant="error" title="The profile could not be saved">
          {saveError}
        </Alert>
      ) : null}

      <section className="card" aria-labelledby="student-profile-details-heading">
        <h2 className="card__title" id="student-profile-details-heading">
          Details
        </h2>
        <dl className="detail-list">
          <div className="detail-list__row">
            <dt>Full name</dt>
            <dd>{profile.fullName || '—'}</dd>
          </div>
          <div className="detail-list__row">
            <dt>Grade</dt>
            <dd>{profile.grade || '—'}</dd>
          </div>
          <div className="detail-list__row">
            <dt>School</dt>
            <dd>{profile.schoolName || '—'}</dd>
          </div>
          <div className="detail-list__row">
            <dt>Phone</dt>
            <dd>{profile.phone || '—'}</dd>
          </div>
        </dl>
      </section>

      {isFormOpen ? (
        <StudentProfileForm
          errors={errors}
          isSubmitting={isSubmitting || saving}
          register={register}
          onSubmit={onSubmit}
          onCancel={cancelEditing}
          submitLabel={creating ? 'Create profile' : 'Save changes'}
        />
      ) : null}

      <section className="card" aria-labelledby="student-profile-protected-heading">
        <h2 className="card__title" id="student-profile-protected-heading">
          Protected fields
        </h2>
        <dl className="detail-list">
          <div className="detail-list__row">
            <dt>Profile ID</dt>
            <dd className="detail-list__mono">{profile.id}</dd>
          </div>
          <div className="detail-list__row">
            <dt>Identity user ID</dt>
            <dd className="detail-list__mono">{profile.identityUserId}</dd>
          </div>
          <div className="detail-list__row">
            <dt>Created</dt>
            <dd>{formatDate(profile.createdAt)}</dd>
          </div>
          <div className="detail-list__row">
            <dt>Updated</dt>
            <dd>{formatDate(profile.updatedAt)}</dd>
          </div>
        </dl>
        <p className="card__hint">
          These fields are managed by the backend. The identity of the profile
          comes from the validated token, so it can neither be read from nor
          written by the browser.
        </p>
      </section>
    </div>
  )
}

interface StudentProfileFormProps {
  errors: Record<string, { message?: string } | undefined>
  isSubmitting: boolean
  register: ReturnType<typeof useForm<StudentProfileFormValues>>['register']
  onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>
  onCancel: () => void
  submitLabel: string
}

function StudentProfileForm({
  errors,
  isSubmitting,
  register,
  onSubmit,
  onCancel,
  submitLabel,
}: StudentProfileFormProps) {
  return (
    <section className="card" aria-labelledby="student-profile-form-heading">
      <h2 className="card__title" id="student-profile-form-heading">
        {submitLabel === 'Create profile'
          ? 'Create your profile'
          : 'Edit your profile'}
      </h2>

      <form className="form" onSubmit={onSubmit} noValidate>
        <FormField
          id="fullName"
          label="Full name"
          error={errors.fullName?.message}
          required
        >
          {(fieldProps) => (
            <input
              {...fieldProps}
              {...register('fullName')}
              className="form-input"
              type="text"
              autoComplete="name"
            />
          )}
        </FormField>

        <div className="form-grid">
          <FormField
            id="grade"
            label="Grade"
            error={errors.grade?.message}
            hint="For example: Grade 8"
          >
            {(fieldProps) => (
              <input
                {...fieldProps}
                {...register('grade')}
                className="form-input"
                type="text"
                autoComplete="off"
              />
            )}
          </FormField>

          <FormField
            id="schoolName"
            label="School"
            error={errors.schoolName?.message}
          >
            {(fieldProps) => (
              <input
                {...fieldProps}
                {...register('schoolName')}
                className="form-input"
                type="text"
                autoComplete="organization"
              />
            )}
          </FormField>
        </div>

        <FormField id="phone" label="Phone" error={errors.phone?.message}>
          {(fieldProps) => (
            <input
              {...fieldProps}
              {...register('phone')}
              className="form-input"
              type="tel"
              autoComplete="tel"
            />
          )}
        </FormField>

        <div className="card__actions">
          <button
            className="button button--primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving…' : submitLabel}
          </button>
          <button
            className="button button--ghost"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}

function toFormValues(profile: StudentProfile): StudentProfileFormValues {
  return {
    fullName: profile.fullName ?? '',
    grade: profile.grade ?? '',
    schoolName: profile.schoolName ?? '',
    phone: profile.phone ?? '',
  }
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}
