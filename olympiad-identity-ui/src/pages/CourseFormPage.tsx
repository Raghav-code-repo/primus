import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Alert } from '../components/Alert'
import { FormField } from '../components/FormField'
import { courseApi } from '../api/courseApi'
import { ApiError } from '../api/errors'
import { COURSE_STATUSES, type CourseStatus } from '../types/course'
import { courseSchema, type CourseFormValues } from '../validation/courseSchemas'

export function CourseFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id = '' } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(mode === 'edit')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      code: '',
      title: '',
      description: '',
      subject: '',
      gradeLevel: '',
      status: 'DRAFT',
    },
  })

  useEffect(() => {
    if (mode !== 'edit' || !id) {
      return
    }
    let active = true

    setLoading(true)
    courseApi
      .get(id)
      .then((course) => {
        if (!active) {
          return
        }
        reset({
          code: course.code,
          title: course.title,
          description: course.description ?? '',
          subject: course.subject,
          gradeLevel: course.gradeLevel,
          status: course.status,
        })
      })
      .catch((error: unknown) => {
        if (!active) {
          return
        }
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'The course could not be loaded from the Course Service.',
        )
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [id, mode, reset])

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)

    const payload = {
      code: values.code,
      title: values.title,
      description: values.description?.trim() ? values.description : undefined,
      subject: values.subject,
      gradeLevel: values.gradeLevel,
      status: values.status,
    }

    try {
      if (mode === 'edit' && id) {
        await courseApi.update(id, payload)
        navigate(`/admin/courses/${id}`, { replace: true })
        return
      }
      const created = await courseApi.create(payload)
      navigate(`/admin/courses/${created.id}`, { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldNames = Object.keys(error.fieldErrors)
        if (fieldNames.length > 0) {
          fieldNames.forEach((field) => {
            setError(field as keyof CourseFormValues, {
              type: 'server',
              message: error.fieldErrors[field],
            })
          })
          return
        }
        setFormError(error.message)
        return
      }
      setFormError('The course could not be saved. Please try again.')
    }
  })

  const isEdit = mode === 'edit'

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="page__eyebrow">Course Service</p>
          <h1 className="page__title">
            {isEdit ? 'Edit course' : 'New course'}
          </h1>
        </div>
        <div className="card__actions">
          <Link className="button button--ghost" to={isEdit && id ? `/admin/courses/${id}` : '/admin/courses'}>
            Cancel
          </Link>
        </div>
      </header>

      {loading ? (
        <section className="card">
          <p className="card__text" role="status">
            Loading the course…
          </p>
        </section>
      ) : null}

      {loadError ? (
        <Alert variant="error" title="The course could not be loaded">
          {loadError}
        </Alert>
      ) : null}

      {formError ? (
        <Alert variant="error" title="The course could not be saved">
          {formError}
        </Alert>
      ) : null}

      {!loading && !loadError ? (
        <section className="card" aria-labelledby="course-form-heading">
          <h2 className="card__title" id="course-form-heading">
            {isEdit ? 'Change the course' : 'Course details'}
          </h2>
          <p className="card__text">
            The Course Service validates the same fields and rejects the
            request with HTTP 400 when one of them is missing.
          </p>

          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="form-grid">
              <FormField
                id="code"
                label="Code"
                error={errors.code?.message}
                hint="At most 30 characters."
                required
              >
                {(fieldProps) => (
                  <input
                    {...fieldProps}
                    {...register('code')}
                    className="form-input"
                    type="text"
                    placeholder="MATH-OLY-001"
                  />
                )}
              </FormField>

              <FormField
                id="gradeLevel"
                label="Grade level"
                error={errors.gradeLevel?.message}
                hint="At most 50 characters."
                required
              >
                {(fieldProps) => (
                  <input
                    {...fieldProps}
                    {...register('gradeLevel')}
                    className="form-input"
                    type="text"
                    placeholder="Grade 6"
                  />
                )}
              </FormField>
            </div>

            <FormField
              id="title"
              label="Title"
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
                  placeholder="Mathematics Olympiad Foundation"
                />
              )}
            </FormField>

            <FormField
              id="subject"
              label="Subject"
              error={errors.subject?.message}
              hint="At most 100 characters."
              required
            >
              {(fieldProps) => (
                <input
                  {...fieldProps}
                  {...register('subject')}
                  className="form-input"
                  type="text"
                  placeholder="Mathematics"
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
                />
              )}
            </FormField>

            <FormField
              id="status"
              label="Status"
              error={errors.status?.message}
              required
            >
              {(fieldProps) => (
                <select
                  {...fieldProps}
                  {...register('status')}
                  className="form-input"
                >
                  {COURSE_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              )}
            </FormField>

            <div className="card__actions">
              <button
                className="button button--primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving…'
                  : isEdit
                    ? 'Save the changes'
                    : 'Create the course'}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  )
}

export type { CourseStatus }
