import {
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from './ThemeContext'

/** Reads the stored preference, falls back to "system". */
export function readStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {
    // Storage can be unavailable, the system preference is used instead.
  }
  return 'system'
}

/** The theme the operating system asks for. */
export function systemTheme(): ResolvedTheme {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  } catch {
    return 'light'
  }
}

/** Applies the theme to the document element. */
export function applyTheme(theme: ResolvedTheme): void {
  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme
}
