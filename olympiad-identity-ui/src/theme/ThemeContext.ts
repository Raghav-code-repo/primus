import { createContext } from 'react'
import type { ReactNode } from 'react'

/** What the user picked. "system" follows the operating system setting. */
export type ThemePreference = 'light' | 'dark' | 'system'

/** The theme that is actually applied to the document. */
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'ola.theme'

export interface ThemeContextValue {
  preference: ThemePreference
  resolvedTheme: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
  /** Cycles light -> dark -> system -> light. */
  cycleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export interface ThemeProviderProps {
  children: ReactNode
  /** Overrides the stored preference, used by the tests. */
  initialPreference?: ThemePreference
}
