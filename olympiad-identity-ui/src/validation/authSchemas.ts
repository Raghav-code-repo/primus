import { z } from 'zod'

/**
 * Frontend rules mirror the bean validation of the Identity Service:
 *  - RegisterRequest.email    -> @NotBlank @Email @Size(max = 255)
 *  - RegisterRequest.password -> @NotBlank @Size(min = 8, max = 72)
 *  - RegisterRequest.firstName -> @NotBlank @Size(max = 100)
 *  - RegisterRequest.lastName  -> @NotBlank @Size(max = 100)
 *  - LoginRequest.email        -> @NotBlank @Email
 *  - LoginRequest.password     -> @NotBlank
 *
 * The backend applies no complexity rules, so the frontend does not add any
 * either. 72 is also the maximum BCrypt input length.
 */

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(255, 'Email must be 255 characters or fewer')

const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be 72 characters or fewer')

const nameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(100, `${label} must be 100 characters or fewer`)

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerSchema = z
  .object({
    firstName: nameSchema('First name'),
    lastName: nameSchema('Last name'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
