import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { Alert } from '../components/Alert'
import { useAuth } from '../auth/useAuth'
import {
  PERMISSION_COURSE_DELETE,
  PERMISSION_COURSE_READ,
  PERMISSION_COURSE_UPDATE,
} from '../auth/permissions'
import { courseApi } from '../api/courseApi'
import { ApiError } from '../api/errors'
import type { Course } from '../types/course'

export function CourseManagementDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { hasPermission } = useAuth()

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const canUpdate = hasPermission(PERMISSION_COURSE_UPDATE)
  const canDelete = hasPermission(PERMISSION_COURSE_DELETE)
  const deleteRequested = searchParams.get('delete') === '1'

  useEffect(() => {
    if (!id) {
      return
    }
    let active = true

    courseApi
      .get(id)
      .then((result) => {
        if (!active) {
          return
        }
        setCourse(result)
        setLoading(false)
      })
      .catch((caught: unknown) => {
        if (!active) {
          return
        }
        setCourse(null)
        setError(
          caught instanceof ApiError
            ? caught.message
            : 'The course could not be loaded from the Course Service.',
        )
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  const onDelete = async () => {
    if (!course) {
      return
    }
    setDeleting(true)
    setDeleteError(null)
    try {
      await courseApi.remove(course.id)
      navigate('/admin/courses', { replace: true })
    } catch (caught) {
      setDeleteError(
        caught instanceof ApiError
          ? caught.message
          : 'The course could not be deleted.',
      )
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setSearchParams({})
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="page__eyebrow">Course Service</p>
          <h1 className="page__title">
            {course ? course.title : 'Course'}
          </h1>
        </div>
        <div className="card__actions">
          <Link className="button button--ghost" to="/admin/courses">
            Back to the list
          </Link>
          {canUpdate && course ? (
            <Link
              className="button button--secondary"
              to={`/admin/courses/${course.id}/edit`}
            >
              Edit course
            </Link>
          ) : null}
          {canDelete && course && !deleteRequested ? (
            <button
              className="button button--ghost"
              type="button"
              onClick={() => setSearchParams({ delete: '1' })}
            >
              Delete course
            </button>
          ) : null}
        </div>
      </header>

      {loading ? (
        <section className="card">
          <p className="card__text" role="status">
            Loading the course…
          </p>
        </section>
      ) : null}

      {error ? (
        <Alert variant="error" title="The course could not be loaded">
          {error}
        </Alert>
      ) : null}

      {deleteError ? (
        <Alert variant="error" title="The course could not be deleted">
          {deleteError}
        </Alert>
      ) : null}

      {deleteRequested && course ? (
        <Alert variant="warning" title="Delete this course?">
          <p>
            The course <strong>{course.title}</strong> ({course.code}) will be
            removed from the Course Service. This cannot be undone.
          </p>
          <div className="card__actions">
            <button
              className="button button--primary"
              type="button"
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Yes, delete the course'}
            </button>
            <button
              className="button button--ghost"
              type="button"
              onClick={cancelDelete}
              disabled={deleting}
            >
              Keep the course
            </button>
          </div>
        </Alert>
      ) : null}

      {course ? (
        <section className="card" aria-labelledby="course-details-heading">
          <h2 className="card__title" id="course-details-heading">
            Details
          </h2>
          <dl className="detail-list">
            <div className="detail-list__row">
              <dt>Code</dt>
              <dd className="detail-list__mono">{course.code}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Title</dt>
              <dd>{course.title}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Description</dt>
              <dd>{course.description || '—'}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Subject</dt>
              <dd>{course.subject}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Grade level</dt>
              <dd>{course.gradeLevel}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Status</dt>
              <dd>
                <span className="badge">{course.status}</span>
              </dd>
            </div>
            <div className="detail-list__row">
              <dt>Course ID</dt>
              <dd className="detail-list__mono">{course.id}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Created</dt>
              <dd>{new Date(course.createdAt).toLocaleString()}</dd>
            </div>
            <div className="detail-list__row">
              <dt>Updated</dt>
              <dd>{new Date(course.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
          <p className="card__hint">
            The course list is read with the permission{' '}
            <code>{PERMISSION_COURSE_READ}</code>, editing requires{' '}
            <code>{PERMISSION_COURSE_UPDATE}</code> and deleting requires{' '}
            <code>{PERMISSION_COURSE_DELETE}</code>. The Course Service checks
            every one of them again on the server.
          </p>
        </section>
      ) : null}
    </div>
  )
}
