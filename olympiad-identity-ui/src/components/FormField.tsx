import type { ReactNode } from 'react'

export interface FormFieldRenderProps {
  id: string
  'aria-invalid': boolean
  'aria-required': boolean
  'aria-describedby': string | undefined
}

interface FormFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: (props: FormFieldRenderProps) => ReactNode
}

/**
 * Accessible label / control / error wrapper. The render prop hands out the
 * accessibility attributes that belong to the control so every field stays
 * wired to its label and validation message.
 */
export function FormField({
  id,
  label,
  error,
  hint,
  required = false,
  children,
}: FormFieldProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className={`form-field${error ? ' form-field--invalid' : ''}`}>
      <label
        className="form-field__label"
        htmlFor={id}
        data-required={required ? 'true' : undefined}
      >
        {label}
      </label>

      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-required': required,
        'aria-describedby': describedBy,
      })}

      {hint ? (
        <p className="form-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}

      {error ? (
        <p className="form-field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
