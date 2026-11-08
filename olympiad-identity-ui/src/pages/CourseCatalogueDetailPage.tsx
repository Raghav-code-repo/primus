import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Alert } from '../components/Alert'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { EnrollButton } from '../components/EnrollButton'
import { Skeleton } from '../components/Skeleton'
import { useAuth } from '../auth/useAuth'
import { isStudent } from '../auth/roles'
import { catalogApi } from '../api/catalogApi'
import { useAsyncResource } from '../hooks/useAsyncResource'
import { useEnrolledCourseIds } from '../hooks/useCatalog'
import type { CatalogCourse } from '../types/course'

/**
 * The details of a single course.
 *
 * The course is read from `GET /api/courses/{id}` of the Student Service, so
 * the page works for every authenticated account.
 */
export function CourseCatalogueDetailPage() {
  const { id = '' } = useParams()
  const { roles } = useAuth()
  const student = isStudent(roles)

  const loader = useCallback(() => catalogApi.get(id), [id])
  const resource = useAsyncResource<CatalogCourse>(
    loader,
    id,
    'The course could not be loaded from the Student Service.',
  )

  const { enrolledCourseIds, markEnrolled } = useEnrolledCourseIds()

  const course = resource.data

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Course Catalogue', to: '/courses' },
          { label: course?.title ?? 'Course' },
        ]}
      />

      <header className="page__header">
        <div>
          <p className="page__eyebrow">Course Catalogue</p>
          <h1 className="page__title">{course ? course.title : 'Course'}</h1>
        </div>
        <div className="card__actions">
          <Link className="button button--ghost" to="/courses">
            Back to the catalogue
          </Link>
        </div>
      </header>

      {resource.loading ? (
        <section className="card">
          <Skeleton lines={6} label="Loading the course" />
        </section>
      ) : null}

      {resource.error ? (
        <Alert variant="error" title="The course could not be loaded">
          {resource.error}
        </Alert>
      ) : null}

      {course ? (
        <>
          <section className="card" aria-labelledby="catalogue-course-heading">
            <h2 className="card__title" id="catalogue-course-heading">
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
            </dl>
          </section>

          {student ? (
            <section className="card" aria-labelledby="catalogue-enroll-heading">
              <h2 className="card__title" id="catalogue-enroll-heading">
                Enrolment
              </h2>

              {enrolledCourseIds.has(course.id) ? (
                <Alert variant="success" title="You are enrolled">
                  This course is part of your enrollments.
                </Alert>
              ) : course.status === 'PUBLISHED' ? (
                <>
                  <p className="card__text">
                    Enrol in this course to add it to your learning plan. The
                    Student Service records the enrollment for your account and
                    checks that the course is open for enrollment.
                  </p>
                  <EnrollButton
                    courseId={course.id}
                    onEnrolled={() => markEnrolled(course.id)}
                  />
                </>
              ) : (
                <Alert variant="info" title="Not open for enrollment">
                  This course is not published, so the backend does not accept
                  an enrollment for it.
                </Alert>
              )}
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
