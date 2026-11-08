import { useId } from 'react'
import { Link } from 'react-router-dom'

interface OlympiadPromoBannerProps {
  /** Optional custom headline override */
  headline?: string
  description?: string
  /** Target link for the CTA button */
  ctaLink?: string
  /** Text for the CTA button */
  ctaText?: string
}

export function OlympiadPromoBanner({
  headline,
  description,
  ctaLink = '/register',
  ctaText = 'APPLY NOW',
}: OlympiadPromoBannerProps) {
  const id = useId().replace(/:/g, '')

  const clipCircleId = `olympiad-circle-${id}`
  const stripesPatternId = `olympiad-stripes-${id}`
  const shadowFilterId = `olympiad-shadow-${id}`
  const calcGradId = `olympiad-calc-grad-${id}`
  const cupGradId = `olympiad-cup-grad-${id}`
  const boardFrameGradId = `olympiad-board-frame-${id}`
  const boardSurfaceGradId = `olympiad-board-surface-${id}`
  const screenGradId = `olympiad-screen-grad-${id}`

  return (
    <div className="olympiad-promo" aria-label="Olympiad Learning Academy Showcase">
      {/* Background ambient lighting */}
      <div className="olympiad-promo__ambient" aria-hidden="true" />

      {/* Top Brand Bar */}
      <header className="olympiad-promo__brand-bar">
        <div className="olympiad-promo__logo-wrapper">
          {/* Creative Multi-faceted Geometric Crest */}
          <svg
            className="olympiad-promo__crest"
            viewBox="0 0 64 64"
            width="46"
            height="46"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`crest-g1-${id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id={`crest-g2-${id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            {/* Hexagonal facet shield */}
            <polygon points="32,4 58,19 58,45 32,60 6,45 6,19" fill={`url(#crest-g1-${id})`} />
            <polygon points="32,8 54,21 54,43 32,55" fill={`url(#crest-g2-${id})`} opacity="0.85" />
            <polygon points="32,15 46,24 46,40 32,48 18,40 18,24" fill="#ffffff" opacity="0.2" />
            {/* Academic Star & Torch */}
            <polygon points="32,20 35,27 42,28 37,33 38,40 32,36 26,40 27,33 22,28 29,27" fill="#ffffff" />
          </svg>
          <div className="olympiad-promo__brand-text">
            <span className="olympiad-promo__brand-title">OLYMPIAD</span>
            <span className="olympiad-promo__brand-sub">ACADEMY</span>
          </div>
        </div>
        <span className="olympiad-promo__tagline">Where Learning Never Stops</span>
      </header>

      {/* Main Showcase Layout */}
      <div className="olympiad-promo__content">
        {/* Left Section: Headings, Highlights & Actions */}
        <div className="olympiad-promo__info">
          <div className="olympiad-promo__titles">
            <span className="olympiad-promo__subtitle">MATHS &amp; SCIENCE</span>
            <h1 className="olympiad-promo__main-title">OLYMPIAD</h1>
            {headline ? <p className="olympiad-promo__headline-sub">{headline}</p> : null}
            {description ? <p className="olympiad-promo__headline-sub">{description}</p> : null}
          </div>

          {/* Scope of Topic Ribbon Pill */}
          <div className="olympiad-promo__scope-pill">
            <span className="olympiad-promo__scope-text">SCOPE OF EXCELLENCE</span>
          </div>

          {/* Value Proposition Highlights */}
          <ul className="olympiad-promo__features" role="list">
            <li className="olympiad-promo__feature-item">
              <span className="olympiad-promo__check-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M7 12.5L10.5 16L17 8.5"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="olympiad-promo__feature-label">Experienced Mentors &amp; Tutors</span>
            </li>

            <li className="olympiad-promo__feature-item">
              <span className="olympiad-promo__check-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M7 12.5L10.5 16L17 8.5"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="olympiad-promo__feature-label">Personalized Mastery Pathways</span>
            </li>

            <li className="olympiad-promo__feature-item">
              <span className="olympiad-promo__check-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M7 12.5L10.5 16L17 8.5"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="olympiad-promo__feature-label">Interactive Online Problem Solving</span>
            </li>

            <li className="olympiad-promo__feature-item">
              <span className="olympiad-promo__check-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M7 12.5L10.5 16L17 8.5"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="olympiad-promo__feature-label">Flexible Scheduling &amp; Live Mocks</span>
            </li>
          </ul>

          {/* Action CTA Button */}
          <div className="olympiad-promo__action">
            <Link to={ctaLink} className="olympiad-promo__btn-apply">
              <span>{ctaText}</span>
              <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>

          {/* Footer Contact Details */}
          <footer className="olympiad-promo__contact">
            <div className="olympiad-promo__contact-item">
              <span className="olympiad-promo__contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
                </svg>
              </span>
              <span className="olympiad-promo__contact-text">+1 (800) 742-OLYMP</span>
            </div>

            <div className="olympiad-promo__contact-item">
              <span className="olympiad-promo__contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </span>
              <span className="olympiad-promo__contact-text">www.olympiad.academy</span>
            </div>

            <div className="olympiad-promo__contact-item">
              <span className="olympiad-promo__contact-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </span>
              <span className="olympiad-promo__contact-text">contact@olympiad.academy</span>
            </div>
          </footer>
        </div>

        {/* Right Section: The Circular Medallion Centerpiece */}
        <div className="olympiad-promo__visual" aria-hidden="true">
          <svg
            className="olympiad-promo__medallion"
            viewBox="0 0 520 520"
            xmlns="http://www.w3.org/2000/svg"
            role="presentation"
          >
            <defs>
              {/* Circular boundary clip */}
              <clipPath id={clipCircleId}>
                <circle cx="260" cy="260" r="236" />
              </clipPath>

              {/* Striped pastel wallpaper pattern */}
              <pattern
                id={stripesPatternId}
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <rect width="14" height="28" className="olympiad-promo__stripe-odd" />
                <rect x="14" width="14" height="28" className="olympiad-promo__stripe-even" />
              </pattern>

              {/* Drop shadow for 3D elements */}
              <filter id={shadowFilterId} x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="0" dy="10" stdDeviation="14" floodOpacity="0.22" />
              </filter>

              {/* Chalkboard frame gradient */}
              <linearGradient id={boardFrameGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>

              {/* Deep blackboard gradient with chalk texture */}
              <linearGradient id={boardSurfaceGradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#08473e" />
                <stop offset="50%" stopColor="#063831" />
                <stop offset="100%" stopColor="#042621" />
              </linearGradient>

              {/* Pencil cup gradient */}
              <linearGradient id={cupGradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#db2777" />
                <stop offset="100%" stopColor="#9d174d" />
              </linearGradient>

              {/* Golden desktop calculator gradient */}
              <linearGradient id={calcGradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              {/* Calculator LCD display */}
              <linearGradient id={screenGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f1f5f9" />
              </linearGradient>
            </defs>

            {/* Medallion Outer Border Glow */}
            <circle
              cx="260"
              cy="260"
              r="244"
              className="olympiad-promo__circle-ring"
              strokeWidth="10"
              fill="none"
            />

            {/* Clipped Interior */}
            <g clipPath={`url(#${clipCircleId})`}>
              {/* Striped Background */}
              <rect x="0" y="0" width="520" height="520" fill={`url(#${stripesPatternId})`} />

              {/* Subtle top spotlight vignette */}
              <radialGradient id={`spot-${id}`} cx="50%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
              </radialGradient>
              <circle cx="260" cy="260" r="236" fill={`url(#spot-${id})`} />

              {/* Floating Mathematical Symbols */}
              <g className="olympiad-promo__math-particles">
                <text x="60" y="110" className="olympiad-promo__particle particle-1">π</text>
                <text x="440" y="100" className="olympiad-promo__particle particle-2">∑</text>
                <text x="75" y="240" className="olympiad-promo__particle particle-3">∞</text>
                <text x="430" y="220" className="olympiad-promo__particle particle-4">√x</text>
                <text x="250" y="65" className="olympiad-promo__particle particle-5">Δ</text>
              </g>

              {/* Chalkboard Easel Wooden Legs */}
              <polygon points="120,440 136,440 180,260 164,260" fill="#334155" opacity="0.9" />
              <polygon points="400,440 384,440 340,260 356,260" fill="#334155" opacity="0.9" />
              <polygon points="252,440 268,440 264,240 256,240" fill="#1e293b" opacity="0.5" />

              {/* Chalkboard Frame with Shadow */}
              <rect
                x="80"
                y="80"
                width="360"
                height="250"
                rx="20"
                fill={`url(#${boardFrameGradId})`}
                filter={`url(#${shadowFilterId})`}
              />

              {/* Chalkboard Surface */}
              <rect
                x="94"
                y="94"
                width="332"
                height="222"
                rx="12"
                fill={`url(#${boardSurfaceGradId})`}
              />

              {/* Chalkboard Title */}
              <text
                x="260"
                y="122"
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="13"
                fontWeight="700"
                letterSpacing="2.8"
                fontFamily="system-ui, sans-serif"
              >
                MATHEMATICS BACKGROUND
              </text>
              <line
                x1="160"
                y1="130"
                x2="360"
                y2="130"
                stroke="#64748b"
                strokeWidth="1.2"
                strokeDasharray="4 3"
                opacity="0.7"
              />

              {/* Left Chalkboard: Coordinate Grid & Functions */}
              <g className="olympiad-promo__chalk-graph">
                {/* Axes */}
                <line x1="112" y1="275" x2="230" y2="275" stroke="#f8fafc" strokeWidth="2.2" strokeLinecap="round" />
                <polygon points="230,271 237,275 230,279" fill="#f8fafc" />
                <text x="238" y="288" fill="#f8fafc" fontSize="11" fontWeight="700" fontFamily="sans-serif">x</text>

                <line x1="130" y1="288" x2="130" y2="152" stroke="#f8fafc" strokeWidth="2.2" strokeLinecap="round" />
                <polygon points="126,152 130,145 134,152" fill="#f8fafc" />
                <text x="120" y="152" fill="#f8fafc" fontSize="11" fontWeight="700" fontFamily="sans-serif">y</text>
                <text x="120" y="288" fill="#cbd5e1" fontSize="10" fontFamily="sans-serif">O</text>

                {/* Function Curve f(x) */}
                <path
                  d="M 130 260 Q 170 255 220 172"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />

                {/* Point 1: f(x1) */}
                <line x1="162" y1="275" x2="162" y2="246" stroke="#f8fafc" strokeWidth="1.4" strokeDasharray="2 2" />
                <line x1="130" y1="246" x2="162" y2="246" stroke="#f8fafc" strokeWidth="1.4" strokeDasharray="2 2" />
                <circle cx="162" cy="246" r="3" fill="#facc15" />
                <text x="104" y="250" fill="#f8fafc" fontSize="9.5" fontWeight="600" fontFamily="sans-serif">f(x₁)</text>

                {/* Point 2: f(x2) */}
                <line x1="198" y1="275" x2="198" y2="200" stroke="#f8fafc" strokeWidth="1.4" strokeDasharray="2 2" />
                <line x1="130" y1="200" x2="198" y2="200" stroke="#f8fafc" strokeWidth="1.4" strokeDasharray="2 2" />
                <circle cx="198" cy="200" r="3" fill="#facc15" />
                <text x="104" y="204" fill="#f8fafc" fontSize="9.5" fontWeight="600" fontFamily="sans-serif">f(x₂)</text>
              </g>

              {/* Right Chalkboard: 3D Cone Geometry */}
              <g className="olympiad-promo__chalk-cone">
                {/* Apex P */}
                <text x="328" y="146" fill="#f8fafc" fontSize="11" fontWeight="700" fontFamily="sans-serif">P</text>
                <circle cx="330" cy="154" r="2.5" fill="#f8fafc" />

                {/* Slant Lines */}
                <line x1="330" y1="154" x2="278" y2="272" stroke="#f8fafc" strokeWidth="2.2" />
                <line x1="330" y1="154" x2="382" y2="272" stroke="#f8fafc" strokeWidth="2.2" />

                {/* Base Ellipse Front Arc */}
                <path
                  d="M 278 272 A 52 17 0 0 0 382 272"
                  fill="none"
                  stroke="#f8fafc"
                  strokeWidth="2.2"
                />
                {/* Base Ellipse Back Arc (Dashed) */}
                <path
                  d="M 278 272 A 52 17 0 0 1 382 272"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.6"
                  strokeDasharray="4 3"
                />

                {/* Central Altitude h */}
                <line x1="330" y1="154" x2="330" y2="272" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="3 3" />
                <text x="319" y="222" fill="#38bdf8" fontSize="11" fontWeight="700" fontFamily="sans-serif">h</text>

                {/* Base Radius r */}
                <line x1="330" y1="272" x2="382" y2="272" stroke="#facc15" strokeWidth="1.8" strokeDasharray="3 2" />
                <text x="352" y="268" fill="#facc15" fontSize="10.5" fontWeight="700" fontFamily="sans-serif">r</text>

                {/* Slant Dimension x */}
                <text x="362" y="206" fill="#f8fafc" fontSize="11" fontWeight="700" fontFamily="sans-serif">x</text>

                {/* Right angle marker at base */}
                <polyline points="330,264 337,264 337,272" fill="none" stroke="#f8fafc" strokeWidth="1.2" />
              </g>

              {/* Bottom Tray of Chalkboard with Chalk */}
              <rect x="74" y="328" width="372" height="12" rx="4" fill="#334155" />
              <rect x="180" y="324" width="18" height="5" rx="2" fill="#f8fafc" />
              <rect x="204" y="325" width="14" height="4" rx="2" fill="#facc15" />

              {/* Foreground Item 1: Stylish Magenta Pencil & Ruler Cup (Left) */}
              <g className="olympiad-promo__cup-group" filter={`url(#${shadowFilterId})`}>
                {/* Violet Ruler */}
                <g transform="rotate(-18 116 350)">
                  <rect x="106" y="280" width="18" height="90" rx="3" fill="#8b5cf6" />
                  <line x1="120" y1="290" x2="124" y2="290" stroke="#ffffff" strokeWidth="1.5" />
                  <line x1="118" y1="298" x2="124" y2="298" stroke="#ffffff" strokeWidth="1.5" />
                  <line x1="116" y1="306" x2="124" y2="306" stroke="#ffffff" strokeWidth="1.5" />
                  <line x1="118" y1="314" x2="124" y2="314" stroke="#ffffff" strokeWidth="1.5" />
                  <line x1="116" y1="322" x2="124" y2="322" stroke="#ffffff" strokeWidth="1.5" />
                </g>

                {/* Yellow Pencil */}
                <g transform="rotate(8 135 340)">
                  <polygon points="135,270 131,286 139,286" fill="#f59e0b" />
                  <polygon points="135,270 133,278 137,278" fill="#1e293b" />
                  <rect x="131" y="286" width="8" height="74" fill="#facc15" />
                  <rect x="131" y="356" width="8" height="6" fill="#cbd5e1" />
                  <rect x="131" y="362" width="8" height="8" rx="2" fill="#f43f5e" />
                </g>

                {/* Cyan Stylus Pencil */}
                <g transform="rotate(-6 122 340)">
                  <polygon points="122,274 118,288 126,288" fill="#0284c7" />
                  <polygon points="122,274 120,280 124,280" fill="#1e293b" />
                  <rect x="118" y="288" width="8" height="70" fill="#38bdf8" />
                </g>

                {/* Pencil Cup Body with Ridges */}
                <path
                  d="M 104 350 L 110 430 Q 111 440 128 440 L 138 440 Q 155 440 156 430 L 162 350 Z"
                  fill={`url(#${cupGradId})`}
                />
                <ellipse cx="133" cy="350" rx="29" ry="8" fill="#be185d" />
                {/* Diagonal aesthetic stripe on cup */}
                <path
                  d="M 107 380 Q 133 392 159 380 L 157 396 Q 133 408 109 396 Z"
                  fill="#ffffff"
                  opacity="0.25"
                />
              </g>

              {/* Foreground Item 2: Modern Golden Calculator (Right/Center) */}
              <g
                className="olympiad-promo__calc-group"
                transform="rotate(-7 360 410)"
                filter={`url(#${shadowFilterId})`}
              >
                {/* Calculator Body */}
                <rect
                  x="280"
                  y="340"
                  width="135"
                  height="125"
                  rx="16"
                  fill={`url(#${calcGradId})`}
                />

                {/* LCD Display */}
                <rect
                  x="294"
                  y="354"
                  width="107"
                  height="26"
                  rx="5"
                  fill={`url(#${screenGradId})`}
                  stroke="#d97706"
                  strokeWidth="1.2"
                />
                <text
                  x="392"
                  y="372"
                  textAnchor="end"
                  fill="#0f172a"
                  fontSize="15"
                  fontWeight="800"
                  fontFamily="'SFMono-Regular', Consolas, monospace"
                  letterSpacing="1"
                >
                  2026.0
                </text>

                {/* Keypad Grid (Clean white & warm keys) */}
                {/* Row 1 */}
                <rect x="296" y="388" width="22" height="13" rx="3.5" fill="#ffffff" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.12))" />
                <rect x="323" y="388" width="22" height="13" rx="3.5" fill="#ffffff" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.12))" />
                <rect x="350" y="388" width="22" height="13" rx="3.5" fill="#ffffff" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.12))" />
                <rect x="377" y="388" width="22" height="13" rx="3.5" fill="#ea580c" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.15))" />

                {/* Row 2 */}
                <rect x="296" y="405" width="22" height="13" rx="3.5" fill="#ffffff" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.12))" />
                <rect x="323" y="405" width="22" height="13" rx="3.5" fill="#ffffff" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.12))" />
                <rect x="350" y="405" width="22" height="13" rx="3.5" fill="#ffffff" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.12))" />
                <rect x="377" y="405" width="22" height="13" rx="3.5" fill="#f97316" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.15))" />

                {/* Row 3 */}
                <rect x="296" y="422" width="22" height="13" rx="3.5" fill="#ffffff" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.12))" />
                <rect x="323" y="422" width="22" height="13" rx="3.5" fill="#ffffff" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.12))" />
                <rect x="350" y="422" width="22" height="13" rx="3.5" fill="#ffffff" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.12))" />
                <rect x="377" y="422" width="22" height="13" rx="3.5" fill="#db2777" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.15))" />

                {/* Row 4 (Zero & Equals) */}
                <rect x="296" y="439" width="49" height="13" rx="3.5" fill="#ffffff" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.12))" />
                <rect x="350" y="439" width="22" height="13" rx="3.5" fill="#ffffff" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.12))" />
                <rect x="377" y="439" width="22" height="13" rx="3.5" fill="#7c3aed" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.18))" />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

