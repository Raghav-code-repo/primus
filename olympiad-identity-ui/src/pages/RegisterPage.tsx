import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { Alert } from '../components/Alert'
import { AuthLayout } from '../components/AuthLayout'
import { FormField } from '../components/FormField'
import { PasswordField } from '../components/PasswordField'
import { useAuth } from '../auth/useAuth'
import { ApiError } from '../api/errors'
import { registerSchema, type RegisterFormValues } from '../validation/authSchemas'

export function RegisterPage() {
  const { register: registerAccount } = useAuth()
  const navigate = useNavigate()

  const [formError, setFormError] = useState<string | null>(null)
  const [conflict, setConflict] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    setConflict(null)
    setSuccess(null)

    try {
      const response = await registerAccount({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      })

      if (response?.accessToken) {
        setSuccess(
          'Your account has been created. Taking you to your dashboard…',
        )
        navigate('/dashboard', { replace: true })
        return
      }

      setSuccess(
        'Your account has been created. Please sign in with your new account.',
      )
      navigate('/login', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldNames = Object.keys(error.fieldErrors)
        if (fieldNames.length > 0) {
          fieldNames.forEach((field) => {
            setError(field as keyof RegisterFormValues, {
              type: 'server',
              message: error.fieldErrors[field],
            })
          })
          return
        }
        if (error.isConflict) {
          setConflict(error.message)
          return
        }
        setFormError(error.message)
        return
      }
      setFormError('Registration failed. Please try again.')
    }
  })

  return (
    <AuthLayout
      headline="Join the academy and start learning today."
      description="New accounts are created with the student role assigned by the Identity Service."
      ctaLink="/courses"
      ctaText="EXPLORE PROGRAMS"
    >
      <header className="auth-card__header">
        <h2 className="auth-card__title">Create your account</h2>
        <p className="auth-card__subtitle">
          All fields are required. Passwords must contain 8 to 72 characters.
        </p>
      </header>

        {conflict ? (
          <Alert variant="error" title="Account already exists">
            {conflict}{' '}
            <Link className="link" to="/login">
              Sign in instead
            </Link>
          </Alert>
        ) : null}

        {formError ? (
          <Alert variant="error" title="Registration failed">
            {formError}
          </Alert>
        ) : null}

        {success ? (
          <Alert variant="success" title="Account created">
            {success}
          </Alert>
        ) : null}

        <form className="form" onSubmit={onSubmit} noValidate>
          <div className="form-grid">
            <FormField
              id="firstName"
              label="First name"
              error={errors.firstName?.message}
              required
            >
              {(fieldProps) => (
                <input
                  {...fieldProps}
                  {...register('firstName')}
                  className="form-input"
                  type="text"
                  autoComplete="given-name"
                />
              )}
            </FormField>

            <FormField
              id="lastName"
              label="Last name"
              error={errors.lastName?.message}
              required
            >
              {(fieldProps) => (
                <input
                  {...fieldProps}
                  {...register('lastName')}
                  className="form-input"
                  type="text"
                  autoComplete="family-name"
                />
              )}
            </FormField>
          </div>

          <FormField
            id="email"
            label="Email address"
            error={errors.email?.message}
            required
          >
            {(fieldProps) => (
              <input
                {...fieldProps}
                {...register('email')}
                className="form-input"
                type="email"
                autoComplete="email"
                placeholder="learner@example.com"
              />
            )}
          </FormField>

          <PasswordField
            id="password"
            label="Password"
            hint="Between 8 and 72 characters."
            error={errors.password?.message}
            autoComplete="new-password"
            registration={register('password')}
            required
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            registration={register('confirmPassword')}
            required
          />

          <button
            className="button button--primary button--block"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already registered?{' '}
          <Link className="link" to="/login">
            Sign in
          </Link>
        </p>
    </AuthLayout>
  )
}

