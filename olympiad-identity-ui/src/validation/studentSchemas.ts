import { z } from 'zod'

/**
 * Frontend rules mirror the bean validation of the Student Service:
 *  - StudentProfileRequest.fullName  -> @NotBlank @Size(max = 100)
 *  - StudentProfileRequest.grade     -> @Size(max = 20)
 *  - StudentProfileRequest.schoolName-> @Size(max = 100)
 *  - StudentProfileRequest.phone     -> @Size(max = 50)
 *
 * The backend only applies a value that is not null, so an empty string is
 * sent for a field the student cleared.
 */

export const studentProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be 100 characters or fewer'),
  grade: z
    .string()
    .trim()
    .max(20, 'Grade must be 20 characters or fewer'),
  schoolName: z
    .string()
    .trim()
    .max(100, 'School name must be 100 characters or fewer'),
  phone: z
    .string()
    .trim()
    .max(50, 'Phone number must be 50 characters or fewer'),
})

export type StudentProfileFormValues = z.infer<typeof studentProfileSchema>
