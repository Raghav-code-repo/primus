import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp, seedSession } from '../../test/utils'

function stubMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('theme switcher', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.removeProperty('color-scheme')
    stubMatchMedia(false)
  })

  it('applies the stored preference to the document', () => {
    renderApp({ route: '/login', theme: 'dark' })

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('switches between light and dark and stores the preference', async () => {
    const user = userEvent.setup()
    renderApp({ route: '/login', theme: 'light' })

    const toggle = screen.getByRole('button', { name: /theme/i })
    expect(toggle).toHaveAttribute('data-theme-preference', 'light')

    await user.click(toggle)

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('ola.theme')).toBe('dark')
    expect(
      screen.getByRole('button', { name: /theme/i }),
    ).toHaveAttribute('data-theme-preference', 'dark')
  })

  it('cycles light, dark and system', async () => {
    const user = userEvent.setup()
    renderApp({ route: '/login', theme: 'light' })

    const toggle = screen.getByRole('button', { name: /theme/i })

    await user.click(toggle)
    expect(
      screen.getByRole('button', { name: /theme/i }),
    ).toHaveAttribute('data-theme-preference', 'dark')

    await user.click(toggle)
    expect(
      screen.getByRole('button', { name: /theme/i }),
    ).toHaveAttribute('data-theme-preference', 'system')

    await user.click(toggle)
    expect(
      screen.getByRole('button', { name: /theme/i }),
    ).toHaveAttribute('data-theme-preference', 'light')
  })

  it('follows the operating system in the system mode', async () => {
    stubMatchMedia(true)
    const user = userEvent.setup()
    renderApp({ route: '/login', theme: 'system' })

    expect(document.documentElement.dataset.theme).toBe('dark')

    const toggle = screen.getByRole('button', { name: /theme/i })
    await user.click(toggle)

    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('offers the switcher on the login page and in the navigation bar', async () => {
    const { unmount } = renderApp({ route: '/login', theme: 'light' })
    expect(screen.getAllByRole('button', { name: /theme/i })).toHaveLength(1)
    unmount()

    seedSession()
    renderApp({ route: '/dashboard', theme: 'light' })
    await screen.findByRole('heading', { name: /welcome back/i })
    expect(screen.getAllByRole('button', { name: /theme/i })).toHaveLength(1)
  })

  it('shows the academy logo on the authentication pages', () => {
    const { container } = renderApp({ route: '/login', theme: 'light' })

    const logos = container.querySelectorAll('.brand-logo')
    expect(logos.length).toBeGreaterThan(0)
    expect(
      screen.getAllByText('Olympiad Learning Academy').length,
    ).toBeGreaterThan(0)
  })

  it('restores the stored preference on the next visit', () => {
    window.localStorage.setItem('ola.theme', 'dark')
    renderApp({ route: '/login' })

    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})
