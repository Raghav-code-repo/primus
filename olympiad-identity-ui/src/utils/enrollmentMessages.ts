import { ApiError } from '../api/errors'

/**
 * Turns the error of the Student Service into a message the student can act
 * on. The technical status codes stay in the error object, the interface only
 * shows the readable part.
 */
export function describeEnrollmentError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'The enrollment could not be created. Please try again.'
  }

  if (error.isConflict) {
    return 'You are already enrolled in this course.'
  }

  if (error.isUnprocessable) {
    return 'This course is not currently open for enrollment.'
  }

  if (error.isNotFound) {
    return 'This course does not exist (any more).'
  }

  if (error.isForbidden) {
    return 'You are not allowed to enroll in this course.'
  }

  if (error.isUnauthorized) {
    return 'Your session is no longer valid. Please sign in again.'
  }

  if (error.isServiceUnavailable) {
    return 'The Student Service is currently unavailable. Please try again in a moment.'
  }

  return error.message
}
