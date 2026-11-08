import { studentClient } from './client'
import type {
  Enrollment,
  EnrollmentCreateRequest,
} from '../types/student'

/**
 * Endpoints of `EnrollmentController`
 * (com.olympiad.student.controller.EnrollmentController).
 * All paths are relative to the Student Service base URL.
 *
 * The self service endpoints take the student identity from the validated JWT
 * (`userId` claim). The request body therefore never carries an identity, a
 * student id or a status: a student can only ever act on their own
 * enrollments.
 */
export interface EnrollmentApi {
  /**
   * GET /api/enrollments/me - the enrollments of the signed-in student.
   */
  listMine(): Promise<Enrollment[]>
  /**
   * POST /api/enrollments - enrolls the signed-in student in a course.
   *
   * Answers with 201 for a new enrollment and 200 when a cancelled enrollment
   * is re-activated, 409 for a duplicate active enrollment, 404 for an unknown
   * course and 422 when the course is not open for enrollment.
   */
  create(payload: EnrollmentCreateRequest): Promise<Enrollment>
  /**
   * DELETE /api/enrollments/{id} - cancels an enrollment.
   * Answers with 204 No Content.
   */
  cancel(id: number): Promise<void>
}

export const enrollmentApi: EnrollmentApi = {
  async listMine(): Promise<Enrollment[]> {
    const response = await studentClient.get<Enrollment[]>('/api/enrollments/me')
    return response.data
  },

  async create(payload: EnrollmentCreateRequest): Promise<Enrollment> {
    const response = await studentClient.post<Enrollment>(
      '/api/enrollments',
      payload,
    )
    return response.data
  },

  async cancel(id: number): Promise<void> {
    await studentClient.delete(`/api/enrollments/${id}`)
  },
}
