import { useState } from 'react'

import { Alert } from './Alert'
import { enrollmentApi } from '../api/enrollmentApi'
import { describeEnrollmentError } from '../utils/enrollmentMessages'

interface EnrollButtonProps {
  /** The course the signed-in student enrolls in. */
  courseId: string
  /** Called after the backend accepted the enrollment. */
  onEnrolled?: (courseId: string) => void
  /** Disables the button, for example while another request is running. */
  disabled?: boolean
  /** The label of the button. */
  label?: string
  className?: string
}

/**
 * The enroll action of a course.
 *
 * The student identity is never part of the request: the Student Service takes
 * it from the validated JWT, so the browser cannot enroll another student.
 */
export function EnrollButton({
  courseId,
  onEnrolled,
  disabled = false,
  label = 'Enroll',
  className = 'button button--primary',
}: EnrollButtonProps) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    if (pending || disabled) {
      return
    }

    setPending(true)
    setError(null)

    try {
      await enrollmentApi.create({ courseId })
      onEnrolled?.(courseId)
    } catch (caught) {
      setError(describeEnrollmentError(caught))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="enroll-action">
      <button
        className={className}
        type="button"
        onClick={handleClick}
        disabled={pending || disabled}
      >
        {pending ? 'Enrolling…' : label}
      </button>

      {error ? (
        <Alert variant="error" title="Enrollment failed">
          {error}
        </Alert>
      ) : null}
    </div>
  )
}
