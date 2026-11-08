import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert } from '../components/Alert'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { CourseCard } from '../components/CourseCard'
import { EmptyState } from '../components/EmptyState'
import { EnrollButton } from '../components/EnrollButton'
import { Skeleton } from '../components/Skeleton'
import { useAuth } from '../auth/useAuth'
import { isStudent } from '../auth/roles'
import { useCatalog, useEnrolledCourseIds } from '../hooks/useCatalog'
import type { CatalogCourse } from '../types/course'

const PAGE_SIZE = 9

/**
 * The course catalogue of the Student Service.
 *
 * The catalogue only contains published courses: the Student Service applies
 * the publication rule of the backend (`CourseCatalogService.DEFAULT_STATUS`)
 * and the frontend does not send a status filter of its own. A course is only
 * offered for enrollment when the backend reports it as `PUBLISHED`.
 */
export function CourseCataloguePage() {
  const { roles } = useAuth()
  const student = isStudent(roles)

  const [subject, setSubject] = useState('')
  const [appliedSubject, setAppliedSubject] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const { courses, totalElements, totalPages, loading, error, reload } =
    useCatalog({ subject: appliedSubject, page, size: PAGE_SIZE })

  const { enrolledCourseIds, reload: reloadEnrollments, markEnrolled } =
    useEnrolledCourseIds()

  const visibleCourses = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) {
      return courses
    }
    return courses.filter((course) =>
      [course.title, course.code, course.subject, course.gradeLevel].some(
        (value) => value?.toLowerCase().includes(term),
      ),
    )
  }, [courses, search])

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault()
    setPage(0)
    setAppliedSubject(subject.trim())
  }

  const clearFilters = () => {
    setSubject('')
    setAppliedSubject('')
    setSearch('')
    setPage(0)
  }

  const isEnrollable = (course: CatalogCourse) => course.status === 'PUBLISHED'

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Course Catalogue' },
        ]}
      />

      <header className="page__header">
        <div>
          <p className="page__eyebrow">Course Catalogue</p>
          <h1 className="page__title">Published courses</h1>
        </div>
        <button
          className="button button--secondary"
          type="button"
          onClick={() => {
            reload()
            reloadEnrollments()
          }}
          disabled={loading}
        >
          Refresh
        </button>
      </header>

      <p className="card__hint">
        The Student Service returns the courses the backend published. Courses
        that are still a draft are not part of the catalogue and cannot be
        enrolled in.
      </p>

      <section className="card" aria-labelledby="catalogue-filters-heading">
        <h2 className="card__title" id="catalogue-filters-heading">
          Filter
        </h2>
        <form className="form" onSubmit={applyFilters}>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-field__label" htmlFor="catalogue-subject">
                Subject
              </label>
              <input
                id="catalogue-subject"
                className="form-input"
                type="text"
                value={subject}
                placeholder="e.g. Mathematics"
                onChange={(event) => setSubject(event.target.value)}
              />
              <p className="form-field__hint">
                Sent to the backend as the subject filter.
              </p>
            </div>

            <div className="form-field">
              <label className="form-field__label" htmlFor="catalogue-search">
                Search
              </label>
              <input
                id="catalogue-search"
                className="form-input"
                type="search"
                value={search}
                placeholder="Title, code or grade"
                onChange={(event) => setSearch(event.target.value)}
              />
              <p className="form-field__hint">
                Narrows the courses of the current page. The backend only
                filters by subject.
              </p>
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
        <Alert variant="error" title="The course catalogue could not be loaded">
          {error}
        </Alert>
      ) : null}

      <section className="card" aria-labelledby="catalogue-list-heading">
        <div className="page__header">
          <h2 className="card__title" id="catalogue-list-heading">
            {loading
              ? 'Loading courses…'
              : `${totalElements} published course${
                  totalElements === 1 ? '' : 's'
                }`}
          </h2>
        </div>

        {loading ? (
          <div className="course-grid" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} lines={4} label="Loading a course" />
            ))}
          </div>
        ) : null}

        {!loading && error ? null : null}

        {!loading && !error && visibleCourses.length === 0 ? (
          <EmptyState
            title="No course matches the current filter"
            description={
              <>
                <p>
                  The Student Service returned no published course for this
                  selection.
                </p>
                {appliedSubject || search ? (
                  <p>Try to reset the filter to see every published course.</p>
                ) : null}
              </>
            }
            action={
              appliedSubject || search ? (
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={clearFilters}
                >
                  Reset the filter
                </button>
              ) : null
            }
          />
        ) : null}

        {!loading && !error && visibleCourses.length > 0 ? (
          <div className="course-grid">
            {visibleCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                to={`/courses/${course.id}`}
                action={
                  student && isEnrollable(course) ? (
                    enrolledCourseIds.has(course.id) ? (
                      <span className="badge badge--success">
                        Enrolled
                      </span>
                    ) : (
                      <EnrollButton
                        courseId={course.id}
                        onEnrolled={(enrolledCourseId) =>
                          markEnrolled(enrolledCourseId)
                        }
                      />
                    )
                  ) : null
                }
              />
            ))}
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
      </section>

      {student ? (
        <p className="card__hint">
          <Link className="link" to="/student/courses">
            Open My Courses to see your enrollments
          </Link>
        </p>
      ) : null}
    </div>
  )
}
