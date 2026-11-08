import { z } from 'zod'

import { COURSE_STATUSES } from '../types/course'

/**
 * Frontend rules mirror the bean validation of the Course Service
 * (`com.olympiad.course.dto.CourseRequest`):
 *
 *  - code        -> @NotBlank @Size(max = 30)
 *  - title       -> @NotBlank @Size(max = 150)
 *  - description -> @Size(max = 2000)
 *  - subject     -> @NotBlank @Size(max = 100)
 *  - gradeLevel  -> @NotBlank @Size(max = 50)
 *  - status      -> @NotNull, one of DRAFT, PUBLISHED, ARCHIVED
 *
 * The backend owns the final decision; these rules only avoid a round trip for
 * input that is obviously invalid.
 */

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`)

export const courseSchema = z.object({
  code: requiredText('Code', 30),
  title: requiredText('Title', 150),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must be 2000 characters or fewer')
    .optional()
    .or(z.literal('')),
  subject: requiredText('Subject', 100),
  gradeLevel: requiredText('Grade level', 50),
  status: z.enum(COURSE_STATUSES, {
    errorMap: () => ({ message: 'Select a valid status' }),
  }),
})

export type CourseFormValues = z.infer<typeof courseSchema>
