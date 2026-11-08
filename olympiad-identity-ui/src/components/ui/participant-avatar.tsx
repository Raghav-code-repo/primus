export interface ParticipantAvatarProps {
  user?: { id: string; name?: string } | null
  identity?: string | null
  name?: string | null | undefined
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function initials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('') || '?'
}

export function ParticipantAvatar({
  user,
  identity,
  name,
  size = 'md',
  className,
}: ParticipantAvatarProps) {
  const displayName = name ?? user?.name ?? identity ?? 'Participant'
  return (
    <div
      className={[
        'avatar',
        `avatar--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={displayName}
    >
      <span className="avatar__initials" aria-hidden="true">
        {initials(displayName)}
      </span>
    </div>
  )
}
