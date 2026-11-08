import { Link } from 'react-router-dom'

import { Alert } from '../components/Alert'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { EmptyState } from '../components/EmptyState'
import { Skeleton } from '../components/Skeleton'
import { useMyEnrollments } from '../hooks/useMyEnrollments'
import type { Enrollment } from '../types/student'

/**
 * The enrollments of the signed-in student.
 *
 * The list is read from `GET /api/enrollments/me`, which the Student Service
 * answers with the enrollments of the identity in the token. The course
 * details are resolved with the course catalogue of the Student Service in a
 * single request, so the page does not send one request per enrollment.
 */
export function MyCoursesPage() {
  const {
    enrollments,
    courses,
    loading,
    error,
    submitting,
    submitError,
    reload,
    cancel,
    clearSubmitError,
  } = useMyEnrollments()

  const active = enrollments.filter((item) => item.status === 'ACTIVE')
  const cancelled = enrollments.filter((item) => item.status === 'CANCELLED')

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'My Courses' },
        ]}
      />

      <header className="page__header">
        <div>
          <p className="page__eyebrow">My Courses</p>
          <h1 className="page__title">Your enrollments</h1>
        </div>
        <div className="card__actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={reload}
            disabled={loading}
          >
            Refresh
          </button>
          <Link className="button button--primary" to="/courses">
            Course Catalogue
          </Link>
        </div>
      </header>

      {error ? (
        <Alert variant="error" title="Your enrollments could not be loaded">
          {error}
        </Alert>
      ) : null}

      {submitError ? (
        <Alert variant="error" title="The enrollment could not be changed">
          {submitError}
        </Alert>
      ) : null}

      {loading ? (
        <section className="card">
          <Skeleton lines={5} label="Loading your enrollments" />
        </section>
      ) : null}

      {!loading && !error && enrollments.length === 0 ? (
        <section className="card">
          <EmptyState
            title="You are not enrolled in any course yet"
            description={
              <p>
                Browse the catalogue of the published courses and enrol in the
                ones you want to take.
              </p>
            }
            action={
              <Link className="button button--primary" to="/courses">
                Open the course catalogue
              </Link>
            }
          />
        </section>
      ) : null}

      {!loading && active.length > 0 ? (
        <section className="card" aria-labelledby="my-courses-active-heading">
          <h2 className="card__title" id="my-courses-active-heading">
            Active enrollments ({active.length})
          </h2>
          <EnrollmentTable
            enrollments={active}
            courses={courses}
            submitting={submitting}
            onCancel={cancel}
            onClearError={clearSubmitError}
          />
        </section>
      ) : null}

      {!loading && cancelled.length > 0 ? (
        <section className="card" aria-labelledby="my-courses-cancelled-heading">
          <h2 className="card__title" id="my-courses-cancelled-heading">
            Cancelled enrollments ({cancelled.length})
          </h2>
          <p className="card__hint">
            A cancelled enrollment can be re-activated: a new enrollment
            request for the same course activates it again.
          </p>
          <EnrollmentTable
            enrollments={cancelled}
            courses={courses}
            submitting={submitting}
            onCancel={cancel}
            onClearError={clearSubmitError}
          />
        </section>
      ) : null}
    </div>
  )
}

interface EnrollmentTableProps {
  enrollments: Enrollment[]
  courses: Map<string, { id: string; code: string; title: string; subject: string; gradeLevel: string }>
  submitting: boolean
  onCancel: (enrollmentId: number) => Promise<boolean>
  onClearError: () => void
}

function EnrollmentTable({
  enrollments,
  courses,
  submitting,
  onCancel,
  onClearError,
}: EnrollmentTableProps) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <caption className="sr-only">
          The enrollments of the signed-in student
        </caption>
        <thead>
          <tr>
            <th scope="col">Course</th>
            <th scope="col">Code</th>
            <th scope="col">Subject</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((enrollment) => {
            const course = courses.get(enrollment.courseId)
            return (
              <tr key={enrollment.id}>
                <td>
                  {course ? (
                    <Link className="link" to={`/courses/${course.id}`}>
                      {course.title}
                    </Link>
                  ) : (
                    <span title="The course is no longer part of the published catalogue">
                      Course {enrollment.courseId}
                    </span>
                  )}
                </td>
                <td>{course?.code ?? '—'}</td>
                <td>{course?.subject ?? '—'}</td>
                <td>
                  <span
                    className={`badge${
                      enrollment.status === 'ACTIVE' ? ' badge--success' : ''
                    }`}
                  >
                    {enrollment.status}
                  </span>
                </td>
                <td>
                  {enrollment.status === 'ACTIVE' ? (
                    <button
                      className="button button--ghost button--small"
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        onClearError()
                        onCancel(enrollment.id)
                      }}
                    >
                      {submitting ? 'Working…' : 'Cancel enrollment'}
                    </button>
                  ) : (
                    <Link
                      className="button button--secondary button--small"
                      to="/courses"
                    >
                      Enrol again
                    </Link>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
