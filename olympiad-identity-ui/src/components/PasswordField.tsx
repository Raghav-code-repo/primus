import { useState } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

import { FormField } from './FormField'

interface PasswordFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  autoComplete?: string
  registration: UseFormRegisterReturn
}

/** Password input with a show/hide toggle. */
export function PasswordField({
  id,
  label,
  error,
  hint,
  required = false,
  autoComplete = 'current-password',
  registration,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <FormField id={id} label={label} error={error} hint={hint} required={required}>
      {(fieldProps) => (
        <div className="password-field">
          <input
            {...fieldProps}
            {...registration}
            className="form-input password-field__input"
            type={visible ? 'text' : 'password'}
            autoComplete={autoComplete}
          />
          <button
            type="button"
            className="password-field__toggle"
            onClick={() => setVisible((current) => !current)}
            aria-pressed={visible}
            aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        </div>
      )}
    </FormField>
  )
}
