import { useTheme } from '../theme/useTheme'
import type { ThemePreference } from '../theme/ThemeContext'

interface ThemeToggleProps {
  /** Shows the name of the active theme next to the icon. */
  showLabel?: boolean
  className?: string
}

const LABELS: Record<ThemePreference, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}

const NEXT_LABEL: Record<ThemePreference, string> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.6 V4.6" />
        <path d="M12 19.4 V21.4" />
        <path d="M2.6 12 H4.6" />
        <path d="M19.4 12 H21.4" />
        <path d="M5.3 5.3 L6.8 6.8" />
        <path d="M17.2 17.2 L18.7 18.7" />
        <path d="M18.7 5.3 L17.2 6.8" />
        <path d="M6.8 17.2 L5.3 18.7" />
      </g>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8a8.6 8.6 0 1 0 10.8 10.8Z"
        fill="currentColor"
      />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect
        x="2.8"
        y="4.2"
        width="18.4"
        height="12.4"
        rx="2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8.4 20.2 H15.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 16.6 V20.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ThemeToggle({ showLabel = false, className }: ThemeToggleProps) {
  const { preference, cycleTheme } = useTheme()
  const Icon =
    preference === 'light' ? SunIcon : preference === 'dark' ? MoonIcon : MonitorIcon

  return (
    <button
      type="button"
      className={className ? `theme-toggle ${className}` : 'theme-toggle'}
      onClick={cycleTheme}
      title={`Theme: ${LABELS[preference]}`}
      aria-label={`Theme: ${LABELS[preference]}. Switch to ${NEXT_LABEL[preference]} theme.`}
      data-theme-preference={preference}
    >
      <Icon />
      {showLabel ? (
        <span className="theme-toggle__label">{LABELS[preference]}</span>
      ) : null}
    </button>
  )
}
