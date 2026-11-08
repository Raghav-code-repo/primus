import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  THEME_STORAGE_KEY,
  ThemeContext,
  type ResolvedTheme,
  type ThemeContextValue,
  type ThemePreference,
  type ThemeProviderProps,
} from './ThemeContext'
import { applyTheme, readStoredPreference, systemTheme } from './themeStorage'

export function ThemeProvider({
  children,
  initialPreference,
}: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(
    () => initialPreference ?? readStoredPreference(),
  )
  const [systemPreference, setSystemPreference] = useState<ResolvedTheme>(
    systemTheme,
  )

  useEffect(() => {
    let media: MediaQueryList
    try {
      media = window.matchMedia('(prefers-color-scheme: dark)')
    } catch {
      return
    }

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPreference(event.matches ? 'dark' : 'light')
    }

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  const resolvedTheme: ResolvedTheme =
    preference === 'system' ? systemPreference : preference

  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // The preference stays active for the running session.
    }
  }, [])

  const cycleTheme = useCallback(() => {
    setPreference(
      preference === 'light'
        ? 'dark'
        : preference === 'dark'
          ? 'system'
          : 'light',
    )
  }, [preference, setPreference])

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      resolvedTheme,
      setPreference,
      cycleTheme,
    }),
    [preference, resolvedTheme, setPreference, cycleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
