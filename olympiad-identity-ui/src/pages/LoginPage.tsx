import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Alert } from '../components/Alert'
import { AuthLayout } from '../components/AuthLayout'
import { FormField } from '../components/FormField'
import { PasswordField } from '../components/PasswordField'
import { useAuth } from '../auth/useAuth'
import { ApiError } from '../api/errors'
import { loginSchema, type LoginFormValues } from '../validation/authSchemas'

interface LocationState {
  from?: string
}

function safeReturnPath(state: unknown): string | null {
  if (typeof state !== 'object' || state === null) {
    return null
  }
  const from = (state as LocationState).from
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) {
    return null
  }
  return from
}

export function LoginPage() {
  const { login, sessionExpired, clearSessionExpired } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [formError, setFormError] = useState<string | null>(null)
  const [expiredNotice] = useState(() => sessionExpired)

  useEffect(() => {
    if (expiredNotice) {
      clearSessionExpired()
    }
  }, [expiredNotice, clearSessionExpired])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login({ email: values.email, password: values.password })
      const returnPath = safeReturnPath(location.state)
      navigate(returnPath ?? '/dashboard', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldNames = Object.keys(error.fieldErrors)
        if (fieldNames.length > 0) {
          fieldNames.forEach((field) => {
            setError(field as keyof LoginFormValues, {
              type: 'server',
              message: error.fieldErrors[field],
            })
          })
          return
        }
        setFormError(error.message)
        return
      }
      setFormError('Sign in failed. Please try again.')
    }
  })

  return (
    <AuthLayout
      headline="One account for every course, contest and classroom."
      ctaLink="/register"
      ctaText="APPLY NOW"
    >
      <header className="auth-card__header">
        <h2 className="auth-card__title">Sign in</h2>
        <p className="auth-card__subtitle">
          Use the email address registered with the Identity Service.
        </p>
      </header>

        {expiredNotice ? (
          <Alert variant="warning" title="Session expired">
            Your session has expired. Please sign in again to continue.
          </Alert>
        ) : null}

        {formError ? (
          <Alert variant="error" title="Sign in failed">
            {formError}
          </Alert>
        ) : null}

        <form className="form" onSubmit={onSubmit} noValidate>
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
            error={errors.password?.message}
            registration={register('password')}
            required
          />

          <button
            className="button button--primary button--block"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-card__footer">
          No account yet?{' '}
          <Link className="link" to="/register">
            Create one
          </Link>
        </p>
    </AuthLayout>
  )
}

