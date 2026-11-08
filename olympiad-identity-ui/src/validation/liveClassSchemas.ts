import { z } from 'zod'

/**
 * Frontend validation rules for creating/updating a live class.
 *
 * They mirror the validation the Live Class Service applies to
 * `CreateLiveClassRequest` / `UpdateLiveClassRequest` and avoid a round trip
 * for input that is obviously invalid. The backend owns the final decision.
 */

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`)

export const liveClassSchema = z
  .object({
    title: requiredText('Title', 150),
    description: z
      .string()
      .trim()
      .max(2000, 'Description must be 2000 characters or fewer')
      .optional()
      .or(z.literal('')),
    courseId: z.string().trim().min(1, 'Select a course'),
    teacherId: z
      .string()
      .trim()
      .min(1, 'Select a teacher')
      .optional()
      .or(z.literal('')),
    startDate: z.string().min(1, 'Start date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endDate: z.string().min(1, 'End date is required'),
    endTime: z.string().min(1, 'End time is required'),
  })
  .superRefine((data, ctx) => {
    const start = parseLocalDateTime(data.startDate, data.startTime)
    const end = parseLocalDateTime(data.endDate, data.endTime)

    if (!start || !end) {
      return
    }

    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be after start time',
        path: ['endTime'],
      })
    }
  })

export type LiveClassFormValues = z.infer<typeof liveClassSchema>

/** Combines a local date and time into a Date, or returns null when invalid. */
function parseLocalDateTime(date: string, time: string): Date | null {
  if (!date || !time) {
    return null
  }
  const [year, month, day] = date.split('-').map((part) => Number(part))
  const [hours, minutes] = time.split(':').map((part) => Number(part))

  if (
    !year ||
    !month ||
    !day ||
    hours === undefined ||
    minutes === undefined ||
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null
  }

  const dateTime = new Date(year, month - 1, day, hours, minutes, 0, 0)

  if (
    dateTime.getFullYear() !== year ||
    dateTime.getMonth() !== month - 1 ||
    dateTime.getDate() !== day ||
    dateTime.getHours() !== hours ||
    dateTime.getMinutes() !== minutes
  ) {
    return null
  }

  return dateTime
}
