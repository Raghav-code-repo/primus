import type { ReactNode } from "react";

interface EduLearnHeroBannerProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  studentStat?: string;
  mentorStat?: string;
  children?: ReactNode;
}

/**
 * Top dashboard celebratory hero banner with Olympiad scholars artwork,
 * gradient backdrop, and key community metrics.
 */
export function EduLearnHeroBanner({
  title,
  subtitle = "Get ready for the 2026 National Maths & Science Olympiad Season.",
  eyebrow,
  studentStat = "75,000+",
  mentorStat = "200+",
  children,
}: EduLearnHeroBannerProps) {
  return (
    <div className="edulearn-hero">
      <div className="edulearn-hero__content">
        {eyebrow ? (
          <span className="edulearn-hero__eyebrow">{eyebrow}</span>
        ) : null}
        <h1 className="edulearn-hero__title">{title}</h1>
        {subtitle ? (
          <p className="edulearn-hero__subtitle">{subtitle}</p>
        ) : null}

        <div className="edulearn-hero__stats">
          <div className="edulearn-hero__stat-pill">
            <span
              className="edulearn-hero__stat-icon edulearn-hero__stat-icon--pink"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
              >
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </span>
            <div className="edulearn-hero__stat-text">
              <span className="edulearn-hero__stat-label">Students</span>
              <span className="edulearn-hero__stat-val">{studentStat}</span>
            </div>
          </div>

          <div className="edulearn-hero__stat-pill">
            <span
              className="edulearn-hero__stat-icon edulearn-hero__stat-icon--amber"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </span>
            <div className="edulearn-hero__stat-text">
              <span className="edulearn-hero__stat-label">Expert Mentors</span>
              <span className="edulearn-hero__stat-val">{mentorStat}</span>
            </div>
          </div>
        </div>

        {children}
      </div>

      {/* Celebratory Scholars Vector Illustration */}
      <div className="edulearn-hero__artwork" aria-hidden="true">
        <svg
          viewBox="0 0 420 280"
          className="edulearn-hero__svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="skin1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbcfe8" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
            <linearGradient id="skin2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
            <linearGradient id="gown-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="diploma-gold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>

          {/* Floating celebratory confetti */}
          <circle cx="80" cy="50" r="4" fill="#fef08a" />
          <circle cx="160" cy="30" r="3" fill="#f472b6" />
          <circle cx="280" cy="45" r="4" fill="#38bdf8" />
          <circle cx="370" cy="60" r="3.5" fill="#facc15" />
          <rect
            x="120"
            y="70"
            width="6"
            height="6"
            rx="1"
            fill="#f43f5e"
            transform="rotate(25 120 70)"
          />
          <rect
            x="230"
            y="25"
            width="7"
            height="7"
            rx="1"
            fill="#a855f7"
            transform="rotate(45 230 25)"
          />
          <rect
            x="330"
            y="35"
            width="6"
            height="6"
            rx="1"
            fill="#34d399"
            transform="rotate(15 330 35)"
          />

          {/* Flying Graduation Cap 1 */}
          <g transform="translate(110, 45) rotate(-15)">
            <polygon points="20,5 38,13 20,21 2,13" fill="#0f172a" />
            <polygon points="12,18 12,24 28,24 28,18" fill="#1e293b" />
            <path d="M 38 13 L 42 26" stroke="#facc15" strokeWidth="2" />
            <circle cx="42" cy="27" r="2" fill="#facc15" />
          </g>

          {/* Flying Graduation Cap 2 */}
          <g transform="translate(240, 20) rotate(18)">
            <polygon points="22,5 42,14 22,23 2,14" fill="#0f172a" />
            <polygon points="13,20 13,26 31,26 31,20" fill="#1e293b" />
            <path d="M 42 14 L 46 27" stroke="#facc15" strokeWidth="2" />
            <circle cx="46" cy="28" r="2" fill="#facc15" />
          </g>

          {/* Scholar 1 (Left - Male student jumping) */}
          <g className="scholar scholar-1">
            {/* Legs & Shoes */}
            <path
              d="M 120 200 L 115 250 L 105 258"
              stroke="#0f172a"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M 140 200 L 155 245 L 170 250"
              stroke="#0f172a"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <ellipse cx="102" cy="260" rx="8" ry="4" fill="#991b1b" />
            <ellipse cx="174" cy="252" rx="8" ry="4" fill="#991b1b" />

            {/* Gown Body */}
            <path
              d="M 105 125 Q 128 115 150 125 L 160 215 Q 128 225 96 215 Z"
              fill="url(#gown-grad)"
            />
            {/* Orange V-Stole / Sash */}
            <path d="M 116 123 L 128 165 L 140 123 Z" fill="#f97316" />

            {/* Arms / Diploma */}
            <path
              d="M 105 135 L 75 110"
              stroke="url(#gown-grad)"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 150 135 L 175 105"
              stroke="url(#gown-grad)"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
            {/* Rolled Diploma in hand */}
            <rect
              x="65"
              y="95"
              width="8"
              height="24"
              rx="3"
              fill="url(#diploma-gold)"
              transform="rotate(-35 65 95)"
            />
            <path d="M 66 108 L 74 108" stroke="#ef4444" strokeWidth="2.5" />

            {/* Head & Face */}
            <circle cx="128" cy="95" r="18" fill="url(#skin2)" />
            <path
              d="M 112 85 Q 128 65 144 85 Q 138 75 128 75 Q 118 75 112 85 Z"
              fill="#1e293b"
            />
            {/* Smile */}
            <path
              d="M 124 102 Q 128 107 133 102"
              stroke="#78350f"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* Scholar 2 (Center - Female student rejoicing) */}
          <g className="scholar scholar-2">
            {/* Legs & Shoes */}
            <path
              d="M 210 205 L 198 250 L 188 258"
              stroke="#0f172a"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M 230 205 L 245 248 L 258 255"
              stroke="#0f172a"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <ellipse cx="185" cy="260" rx="8" ry="4" fill="#0369a1" />
            <ellipse cx="262" cy="256" rx="8" ry="4" fill="#0369a1" />

            {/* Gown Body */}
            <path
              d="M 195 120 Q 220 110 245 120 L 255 215 Q 220 226 185 215 Z"
              fill="url(#gown-grad)"
            />
            {/* Gold Sash */}
            <path d="M 208 120 L 220 165 L 232 120 Z" fill="#eab308" />

            {/* Raised Arms rejoicing */}
            <path
              d="M 195 130 L 165 90"
              stroke="url(#gown-grad)"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 245 130 L 275 88"
              stroke="url(#gown-grad)"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />

            {/* Rolled Diploma in right hand */}
            <rect
              x="275"
              y="75"
              width="8"
              height="24"
              rx="3"
              fill="url(#diploma-gold)"
              transform="rotate(28 275 75)"
            />
            <path d="M 280 88 L 288 88" stroke="#ef4444" strokeWidth="2.5" />

            {/* Head & Hair */}
            <path
              d="M 205 92 Q 220 70 235 92 L 238 120 Q 220 125 202 120 Z"
              fill="#451a03"
            />
            <circle cx="220" cy="90" r="17" fill="url(#skin1)" />
            {/* Smile */}
            <path
              d="M 216 97 Q 220 102 225 97"
              stroke="#9d174d"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* Scholar 3 (Right - Female scholar with cap and book) */}
          <g className="scholar scholar-3">
            {/* Legs & Shoes */}
            <path
              d="M 315 205 L 310 252 L 302 260"
              stroke="#0f172a"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M 335 205 L 348 250 L 360 256"
              stroke="#0f172a"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <ellipse cx="298" cy="262" rx="8" ry="4" fill="#be185d" />
            <ellipse cx="363" cy="258" rx="8" ry="4" fill="#be185d" />

            {/* Gown Body */}
            <path
              d="M 300 125 Q 325 116 350 125 L 360 215 Q 325 225 290 215 Z"
              fill="url(#gown-grad)"
            />
            {/* Cyan Sash */}
            <path d="M 313 124 L 325 168 L 337 124 Z" fill="#06b6d4" />

            {/* Arms holding academic book/folder */}
            <path
              d="M 305 135 L 320 170"
              stroke="url(#gown-grad)"
              strokeWidth="11"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 345 135 L 330 170"
              stroke="url(#gown-grad)"
              strokeWidth="11"
              strokeLinecap="round"
              fill="none"
            />
            {/* Book / Certificate Folder */}
            <rect
              x="312"
              y="152"
              width="28"
              height="34"
              rx="4"
              fill="#f97316"
              transform="rotate(-6 312 152)"
            />
            <rect
              x="318"
              y="158"
              width="16"
              height="22"
              rx="2"
              fill="#ffffff"
              opacity="0.9"
            />

            {/* Head & Cap on head */}
            <circle cx="325" cy="94" r="17" fill="url(#skin2)" />
            {/* Cap */}
            <polygon points="325,64 345,73 325,82 305,73" fill="#0f172a" />
            <polygon points="316,79 316,85 334,85 334,79" fill="#1e293b" />
            <path d="M 345 73 L 348 84" stroke="#facc15" strokeWidth="1.8" />
            <circle cx="348" cy="85" r="1.8" fill="#facc15" />
          </g>
        </svg>
      </div>
    </div>
  );
}
