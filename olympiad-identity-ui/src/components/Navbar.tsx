import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth/useAuth'
import { normalizeRole } from '../auth/roles'
import { buildNavigation } from '../config/navigation'
import { BrandLogo } from './BrandLogo'
import { ThemeToggle } from './ThemeToggle'

/**
 * The primary navigation of the academy.
 *
 * The entries are built from the identity that the Identity Service reported
 * for the signed-in account, so a student never sees the administration and an
 * administrator never sees the student pages. The backend checks every
 * protected route again.
 */
export function Navbar() {
  const { user, roles, hasPermission, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const items = buildNavigation({ roles, hasPermission })

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link className="navbar__brand" to="/dashboard">
          <BrandLogo size={36} />
          <span className="navbar__brand-text">Olympiad Learning Academy</span>
        </Link>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">
            {menuOpen ? 'Close navigation' : 'Open navigation'}
          </span>
          <span className="navbar__toggle-bar" aria-hidden="true" />
          <span className="navbar__toggle-bar" aria-hidden="true" />
          <span className="navbar__toggle-bar" aria-hidden="true" />
        </button>

        <nav
          id="primary-navigation"
          className={`navbar__nav${menuOpen ? ' navbar__nav--open' : ''}`}
          aria-label="Primary"
        >
          {items.map((item) => (
            <NavLink
              key={item.to}
              className="navbar__link"
              to={item.to}
              end={item.end}
              onClick={closeMenu}
              title={item.label}
            >
              {item.label}
            </NavLink>
          ))}

          <div className="navbar__account">
            {user ? (
              <span className="navbar__user" title={user.email}>
                <span className="navbar__user-name">
                  {user.firstName} {user.lastName}
                </span>
                {roles.length > 0 ? (
                  <span className="navbar__user-role">
                    {roles.map((role) => normalizeRole(role)).join(', ')}
                  </span>
                ) : null}
              </span>
            ) : null}
            <button
              type="button"
              className="button button--ghost navbar__logout"
              onClick={handleLogout}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
              <span>Log out</span>
            </button>
          </div>
        </nav>

        <ThemeToggle className="navbar__theme" />
      </div>
    </header>
  )
}
