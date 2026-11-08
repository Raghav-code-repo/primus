import { studentClient } from './client'
import type {
  StudentProfile,
  StudentProfileRequest,
  StudentUpdateRequest,
} from '../types/student'

/**
 * Endpoints of `StudentController`
 * (com.olympiad.student.controller.StudentController).
 * All paths are relative to the Student Service base URL.
 *
 * The `/me` endpoints derive the student identity from the validated JWT
 * (`userId` claim), so no identifier of the student is ever sent by the
 * browser. The backend owns the ownership check.
 */
export interface StudentApi {
  /**
   * GET /api/students/me - the profile of the signed-in student.
   * Answers with 404 when the signed-in student has no profile yet.
   */
  getMyProfile(): Promise<StudentProfile>
  /**
   * POST /api/students/me - creates the profile of the signed-in student.
   * Answers with 409 when a profile already exists for the identity.
   */
  createMyProfile(payload: StudentProfileRequest): Promise<StudentProfile>
  /**
   * PUT /api/students/me - updates the profile of the signed-in student.
   */
  updateMyProfile(payload: StudentUpdateRequest): Promise<StudentProfile>
}

export const studentApi: StudentApi = {
  async getMyProfile(): Promise<StudentProfile> {
    const response = await studentClient.get<StudentProfile>('/api/students/me')
    return response.data
  },

  async createMyProfile(
    payload: StudentProfileRequest,
  ): Promise<StudentProfile> {
    const response = await studentClient.post<StudentProfile>(
      '/api/students/me',
      payload,
    )
    return response.data
  },

  async updateMyProfile(
    payload: StudentUpdateRequest,
  ): Promise<StudentProfile> {
    const response = await studentClient.put<StudentProfile>(
      '/api/students/me',
      payload,
    )
    return response.data
  },
}
