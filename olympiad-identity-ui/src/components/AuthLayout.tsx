import type { ReactNode } from 'react'

import { BrandLogo } from './BrandLogo'
import { OlympiadPromoBanner } from './OlympiadPromoBanner'
import { ThemeToggle } from './ThemeToggle'

export interface AuthLayoutProps {
  headline?: string
  description?: string
  ctaLink?: string
  ctaText?: string
  children: ReactNode
}

/**
 * Shared shell of the login and registration pages:
 * - Login form card on the LEFT
 * - Olympiad promotional showcase design on the RIGHT
 */
export function AuthLayout({
  headline,
  description,
  ctaLink = '/register',
  ctaText = 'APPLY NOW',
  children,
}: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      {/* Form card on the LEFT */}
      <section className="auth-card">
        <div className="auth-card__topbar">
          <div className="auth-card__brand">
            <BrandLogo size={34} />
            <span className="auth-card__brand-name">
              Olympiad Learning Academy
            </span>
          </div>
          <ThemeToggle />
        </div>

        {children}
      </section>

      {/* Olympiad promotional showcase design on the RIGHT */}
      <section className="auth-layout__aside" aria-label="Olympiad Academy Highlights">
        <OlympiadPromoBanner
          headline={headline}
          description={description}
          ctaLink={ctaLink}
          ctaText={ctaText}
        />
      </section>
    </div>
  )
}
