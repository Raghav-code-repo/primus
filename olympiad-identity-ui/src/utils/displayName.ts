const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuidLike(value: string | null | undefined): boolean {
  if (!value) return false
  return UUID_RE.test(value.trim())
}

export function emailPrefix(email: string | null | undefined): string | null {
  if (!email || typeof email !== 'string') return null
  const at = email.indexOf('@')
  const prefix = (at > 0 ? email.slice(0, at) : email).trim()
  return prefix || null
}

export interface ResolveDisplayNameInput {
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  username?: string | null
  email?: string | null
  identity?: string | null
  isLocal?: boolean
}

/**
 * Resolves a human-readable display name without exposing raw UUIDs in UI.
 * Order: explicit/full name parts -> username -> email prefix -> "You"/"Participant".
 * UUID-like values are never returned for display.
 */
export function resolveDisplayName(input: ResolveDisplayNameInput): string {
  const fromParts = [input.firstName, input.lastName].filter(Boolean).join(' ').trim()
  const candidates = [input.fullName, fromParts, input.name, input.username, emailPrefix(input.email)]
  for (const c of candidates) {
    const v = typeof c === 'string' ? c.trim() : ''
    if (v && !isUuidLike(v)) return v
  }
  return input.isLocal ? 'You' : 'Participant'
}

export function resolveParticipantDisplayName(
  identity: string | null | undefined,
  name: string | null | undefined,
  opts?: { isLocal?: boolean; localProfile?: ResolveDisplayNameInput | null },
): string {
  if (opts?.isLocal && opts.localProfile) {
    return resolveDisplayName({ ...opts.localProfile, identity, isLocal: true })
  }
  return resolveDisplayName({ name, identity, isLocal: opts?.isLocal })
}
