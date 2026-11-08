/**
 * Types mirroring the Student Service DTOs.
 * Source of truth: com.olympiad.student.dto.* and
 * com.olympiad.student.entity.EnrollmentStatus.
 */

/**
 * `StudentResponse` - returned by GET /api/students/me, POST /api/students/me
 * and PUT /api/students/me.
 *
 * `identityUserId` is the stable Identity Service user id the profile belongs
 * to. The frontend only displays it - it is never sent back and never used to
 * decide which profile is loaded. The backend derives the identity of the
 * request from the validated JWT (`userId` claim).
 */
export interface StudentProfile {
  id: number
  identityUserId: string
  fullName: string | null
  grade: string | null
  schoolName: string | null
  phone: string | null
  createdAt: string | null
  updatedAt: string | null
}

/**
 * `StudentProfileRequest` - body of POST /api/students/me.
 *
 * `fullName` is required (`@NotBlank`, max 100). The other fields are
 * optional (`@Size` only) and are never null: an empty string clears the
 * value on the server.
 */
export interface StudentProfileRequest {
  fullName: string
  grade?: string
  schoolName?: string
  phone?: string
}

/**
 * `StudentUpdateRequest` - body of PUT /api/students/me.
 *
 * The same fields as {@link StudentProfileRequest}; the backend only applies a
 * value that is not null, so an omitted field keeps the stored value.
 */
export type StudentUpdateRequest = StudentProfileRequest

/**
 * `EnrollmentStatus` - the lifecycle of an enrollment.
 * `ACTIVE` means the student is currently enrolled, `CANCELLED` means the
 * enrollment was cancelled and can be re-activated by a new enrollment request.
 */
export const ENROLLMENT_STATUSES = ['ACTIVE', 'CANCELLED'] as const

export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number]

/**
 * `EnrollmentResponse` - returned by POST /api/enrollments and
 * GET /api/enrollments/me.
 *
 * The record only carries identifiers: the course details are owned by the
 * Course Service and are read through GET /api/courses/{id}.
 */
export interface Enrollment {
  id: number
  identityUserId: string
  studentProfileId: number | null
  courseId: string
  status: EnrollmentStatus
  createdAt: string
  updatedAt: string
}

/** `EnrollmentCreateRequest` - body of POST /api/enrollments. */
export interface EnrollmentCreateRequest {
  courseId: string
}

export function isEnrollmentStatus(value: unknown): value is EnrollmentStatus {
  return (
    typeof value === 'string' &&
    (ENROLLMENT_STATUSES as readonly string[]).includes(value)
  )
}
