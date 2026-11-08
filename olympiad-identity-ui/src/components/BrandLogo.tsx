import { useId } from 'react'

interface BrandLogoProps {
  /** Rendered size in pixels. */
  size?: number
  /** Accessible name. Without it the logo is marked as decorative. */
  title?: string
  className?: string
}

/**
 * Olympiad Learning Academy mark: a graduation cap on a rounded gradient
 * tile. The gradient is defined inline so the logo keeps its own colours in
 * both the light and the dark theme.
 */
export function BrandLogo({
  size = 40,
  title,
  className,
}: BrandLogoProps) {
  const gradientId = useId()

  return (
    <span
      className={className ? `brand-logo ${className}` : 'brand-logo'}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
        role={title ? 'img' : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
        focusable="false"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="4"
            y1="2"
            x2="44"
            y2="46"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#3B6BFF" />
            <stop offset="0.55" stopColor="#5B4BE8" />
            <stop offset="1" stopColor="#8B3FD1" />
          </linearGradient>
        </defs>

        <rect x="1" y="1" width="46" height="46" rx="13" fill={`url(#${gradientId})`} />

        <path
          d="M24 13.2 L38 20.8 L24 28.4 L10 20.8 Z"
          fill="#FFFFFF"
          fillOpacity="0.97"
        />
        <path
          d="M17 24.4 L17 30.1 C17 33 20.1 35.3 24 35.3 C27.9 35.3 31 33 31 30.1 L31 24.4 L24 27.5 Z"
          fill="#FFFFFF"
          fillOpacity="0.8"
        />
        <path
          d="M38 20.8 L38 32.2"
          stroke="#FFD166"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
        <circle cx="38" cy="34.3" r="2.3" fill="#FFD166" />
      </svg>
    </span>
  )
}
