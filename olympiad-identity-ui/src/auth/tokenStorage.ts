/**
 * Token storage for the Identity Service.
 *
 * The backend is stateless and returns a bearer JWT in the JSON body of
 * POST /api/auth/login and POST /api/auth/register. It does not set cookies,
 * does not implement a refresh endpoint and has no revocation endpoint, so the
 * browser must keep the token itself.
 *
 * Strategy (single place, documented in README.md):
 *  - Primary: in-memory reference, so the token never has to be serialised on
 *    every request.
 *  - Persistence: `sessionStorage`, scoped to the browser tab, so a page reload
 *    can restore the session. It is cleared when the tab is closed.
 *
 * Limitation: any script running on this origin can read `sessionStorage`. A
 * successful XSS can therefore exfiltrate the token until it expires
 * (1 hour by default, `security.jwt.expiration-ms`). The backend offers no
 * revocation endpoint, so a leaked token cannot be invalidated early. Use a
 * strict CSP, HTTPS and short token lifetimes in production.
 */

const STORAGE_KEY = 'ola.auth.session'

export interface StoredSession {
  accessToken: string
  tokenType: string
  /** Epoch milliseconds at which the token expires. */
  expiresAt: number
}

let memorySession: StoredSession | null = null

function readStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return null
    }
    return window.sessionStorage
  } catch {
    return null
  }
}

function readPersistedSession(): StoredSession | null {
  const storage = readStorage()
  if (!storage) {
    return null
  }
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as StoredSession).accessToken === 'string' &&
      typeof (parsed as StoredSession).expiresAt === 'number'
    ) {
      return parsed as StoredSession
    }
    return null
  } catch {
    return null
  }
}

function writePersistedSession(session: StoredSession | null): void {
  const storage = readStorage()
  if (!storage) {
    return
  }
  try {
    if (session) {
      storage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      storage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Storage can be unavailable (private mode, quota). In-memory state stays authoritative.
  }
}

export function getSession(): StoredSession | null {
  if (memorySession) {
    return memorySession
  }
  const persisted = readPersistedSession()
  if (persisted) {
    memorySession = persisted
  }
  return memorySession
}

export function setSession(session: StoredSession): void {
  memorySession = session
  writePersistedSession(session)
}

export function clearSession(): void {
  memorySession = null
  writePersistedSession(null)
}

export function getAccessToken(): string | null {
  const session = getSession()
  if (!session) {
    return null
  }
  if (isExpired(session)) {
    return null
  }
  return session.accessToken
}

export function isExpired(session: StoredSession, now = Date.now()): boolean {
  return session.expiresAt <= now
}
