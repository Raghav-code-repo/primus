import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert } from '../components/Alert'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { PermissionGuard } from '../auth/PermissionGuard'
import { useAuth } from '../auth/useAuth'
import {
  PERMISSION_COURSE_CREATE,
  PERMISSION_COURSE_DELETE,
  PERMISSION_COURSE_READ,
  PERMISSION_COURSE_UPDATE,
} from '../auth/permissions'
import { useCourseList } from '../hooks/useCourseList'
import { COURSE_STATUSES, type CourseStatus } from '../types/course'

const PAGE_SIZE = 10

export function CourseManagementPage() {
  const { hasPermission } = useAuth()

  const [status, setStatus] = useState<CourseStatus | ''>('')
  const [subject, setSubject] = useState('')
  const [appliedSubject, setAppliedSubject] = useState('')
  const [page, setPage] = useState(0)

  const { courses, page: result, loading, error, reload } = useCourseList({
    status,
    subject: appliedSubject,
    page,
    size: PAGE_SIZE,
  })

  const canRead = hasPermission(PERMISSION_COURSE_READ)

  const totalPages = result?.totalPages ?? 0
  const totalElements = result?.totalElements ?? 0

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault()
    setPage(0)
    setAppliedSubject(subject.trim())
  }

  const clearFilters = () => {
    setStatus('')
    setSubject('')
    setAppliedSubject('')
    setPage(0)
  }

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Course Management' },
        ]}
      />

      <header className="page__header">
        <div>
          <p className="page__eyebrow">Course Service</p>
          <h1 className="page__title">Courses</h1>
        </div>
        <PermissionGuard permission={PERMISSION_COURSE_CREATE}>
          <Link className="button button--primary" to="/admin/courses/new">
            New course
          </Link>
        </PermissionGuard>
      </header>

      <section className="card" aria-labelledby="course-filters-heading">
        <h2 className="card__title" id="course-filters-heading">
          Filter
        </h2>
        <form className="form" onSubmit={applyFilters}>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-field__label" htmlFor="course-status">
                Status
              </label>
              <select
                id="course-status"
                className="form-input"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as CourseStatus | '')
                  setPage(0)
                }}
              >
                <option value="">All statuses</option>
                {COURSE_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-field__label" htmlFor="course-subject">
                Subject
              </label>
              <input
                id="course-subject"
                className="form-input"
                type="text"
                value={subject}
                placeholder="e.g. Mathematics"
                onChange={(event) => setSubject(event.target.value)}
              />
            </div>
          </div>

          <div className="card__actions">
            <button className="button button--secondary" type="submit">
              Apply filter
            </button>
            <button
              className="button button--ghost"
              type="button"
              onClick={clearFilters}
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      {error ? (
        <Alert variant="error" title="The courses could not be loaded">
          {error}
        </Alert>
      ) : null}

      <section className="card" aria-labelledby="course-list-heading">
        <div className="page__header">
          <h2 className="card__title" id="course-list-heading">
            {loading
              ? 'Loading courses…'
              : `${totalElements} course${totalElements === 1 ? '' : 's'}`}
          </h2>
          <button
            className="button button--ghost button--small"
            type="button"
            onClick={reload}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="card__text" role="status">
            Requesting the course list from the Course Service…
          </p>
        ) : null}

        {!loading && !error && courses.length === 0 ? (
          <p className="card__text">
            No course matches the current filter. The Course Service returned an
            empty list.
          </p>
        ) : null}

        {!loading && courses.length > 0 ? (
          <div className="table-wrapper">
            <table className="table">
              <caption className="sr-only">
                Courses available in the Course Service
              </caption>
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Title</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Grade level</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.code}</td>
                    <td>
                      <Link className="link" to={`/admin/courses/${course.id}`}>
                        {course.title}
                      </Link>
                    </td>
                    <td>{course.subject}</td>
                    <td>{course.gradeLevel}</td>
                    <td>
                      <span className="badge">{course.status}</span>
                    </td>
                    <td>
                      <div className="card__actions">
                        <Link
                          className="button button--ghost button--small"
                          to={`/admin/courses/${course.id}`}
                        >
                          View
                        </Link>
                        <PermissionGuard permission={PERMISSION_COURSE_UPDATE}>
                          <Link
                            className="button button--secondary button--small"
                            to={`/admin/courses/${course.id}/edit`}
                          >
                            Edit
                          </Link>
                        </PermissionGuard>
                        <PermissionGuard permission={PERMISSION_COURSE_DELETE}>
                          <Link
                            className="button button--ghost button--small"
                            to={`/admin/courses/${course.id}?delete=1`}
                          >
                            Delete
                          </Link>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!loading && totalPages > 1 ? (
          <div className="card__actions">
            <button
              className="button button--ghost button--small"
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
            >
              Previous page
            </button>
            <span className="tag-list__description">
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="button button--ghost button--small"
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next page
            </button>
          </div>
        ) : null}

        {!canRead ? (
          <p className="card__hint">
            The Course Service did not report the permission{' '}
            <code>{PERMISSION_COURSE_READ}</code> for this account, so the
            course list is not available.
          </p>
        ) : null}
      </section>
    </div>
  )
}
