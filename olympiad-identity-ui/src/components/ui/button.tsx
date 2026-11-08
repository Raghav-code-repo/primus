import { type ComponentPropsWithRef } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'

export interface ButtonProps
  extends Omit<ComponentPropsWithRef<'button'>, 'size' | 'variant' | 'type' | 'className'> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        'button',
        `button--${variant}`,
        `button--${size}`,
        disabled ? 'button--disabled' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}

export interface IconButtonProps
  extends Omit<ComponentPropsWithRef<'button'>, 'type' | 'className' | 'aria-label'> {
  variant?: 'ghost' | 'primary' | 'secondary' | 'danger' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  className?: string
  active?: boolean
  ariaLabel: string
}

export function IconButton({
  className,
  variant = 'ghost',
  size = 'md',
  type = 'button',
  active,
  disabled,
  ariaLabel,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      aria-pressed={active ? true : undefined}
      aria-label={ariaLabel}
      className={[
        'icon-button',
        `icon-button--${variant}`,
        `icon-button--${size}`,
        active ? 'icon-button--active' : '',
        disabled ? 'icon-button--disabled' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}
