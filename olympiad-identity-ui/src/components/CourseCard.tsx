import { Link } from 'react-router-dom'

import type { CatalogCourse } from '../types/course'

interface CourseCardProps {
  course: CatalogCourse
  /** Shows the publication state of the course. */
  showStatus?: boolean
  /** The action the card offers, for example an enroll button. */
  action?: React.ReactNode
  /** The target of the title link. */
  to?: string
}

/**
 * A responsive card of the course catalogue. Only the fields the Course
 * Service really returns are shown.
 */
export function CourseCard({
  course,
  showStatus = false,
  action,
  to,
}: CourseCardProps) {
  const title = to ? (
    <Link className="course-card__title" to={to}>
      {course.title}
    </Link>
  ) : (
    <h3 className="course-card__title">{course.title}</h3>
  )

  return (
    <article className="course-card">
      <div className="course-card__header">
        <p className="course-card__code">{course.code}</p>
        {showStatus ? (
          <span className="badge course-card__status">{course.status}</span>
        ) : null}
      </div>

      {title}

      <p className="course-card__description">
        {course.description || 'No description has been provided yet.'}
      </p>

      <dl className="course-card__meta">
        <div>
          <dt>Subject</dt>
          <dd>{course.subject}</dd>
        </div>
        <div>
          <dt>Grade level</dt>
          <dd>{course.gradeLevel}</dd>
        </div>
      </dl>

      {action ? <div className="course-card__actions">{action}</div> : null}
    </article>
  )
}
