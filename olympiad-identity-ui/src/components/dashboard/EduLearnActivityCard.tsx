import { useId } from 'react'

export function EduLearnActivityCard() {
  const gradientId = useId().replace(/:/g, '')

  return (
    <div className="edulearn-activity-panel">
      {/* Monthly Progress Chart Box */}
      <div className="edulearn-card edulearn-activity-card">
        <div className="edulearn-card__header">
          <div>
            <h3 className="edulearn-card__title">Monthly Progress</h3>
            <span className="edulearn-card__subtitle">This is the latest improvement</span>
          </div>

          <div className="edulearn-calendar-pill" aria-label="Calendar view">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" />
            </svg>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="edulearn-chart-wrapper" aria-hidden="true">
          <svg
            viewBox="0 0 360 160"
            className="edulearn-progress-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={`area-grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="38" y1="20" x2="350" y2="20" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 3" />
            <text x="10" y="24" fill="var(--color-text-muted)" fontSize="9" fontFamily="sans-serif">80%</text>

            <line x1="38" y1="50" x2="350" y2="50" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 3" />
            <text x="10" y="54" fill="var(--color-text-muted)" fontSize="9" fontFamily="sans-serif">60%</text>

            <line x1="38" y1="80" x2="350" y2="80" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 3" />
            <text x="10" y="84" fill="var(--color-text-muted)" fontSize="9" fontFamily="sans-serif">40%</text>

            <line x1="38" y1="110" x2="350" y2="110" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 3" />
            <text x="10" y="114" fill="var(--color-text-muted)" fontSize="9" fontFamily="sans-serif">20%</text>

            <line x1="38" y1="135" x2="350" y2="135" stroke="var(--color-border)" strokeWidth="1.2" />
            <text x="15" y="138" fill="var(--color-text-muted)" fontSize="9" fontFamily="sans-serif">0%</text>

            {/* Area Fill */}
            <path
              d="M 45 130 Q 95 125 130 95 T 210 88 T 285 50 T 350 42 L 350 135 L 45 135 Z"
              fill={`url(#area-grad-${gradientId})`}
            />

            {/* Smooth Progress Line */}
            <path
              d="M 45 130 Q 95 125 130 95 T 210 88 T 285 50 T 350 42"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            {/* Month Labels */}
            <text x="50" y="152" fill="var(--color-text-muted)" fontSize="9.5" textAnchor="middle">Jan</text>
            <text x="110" y="152" fill="var(--color-text-muted)" fontSize="9.5" textAnchor="middle">Feb</text>
            <text x="170" y="152" fill="var(--color-text-muted)" fontSize="9.5" textAnchor="middle">Mar</text>
            <text x="230" y="152" fill="var(--color-text-muted)" fontSize="9.5" textAnchor="middle">Apr</text>
            <text x="290" y="152" fill="var(--color-text-muted)" fontSize="9.5" textAnchor="middle">May</text>
            <text x="345" y="152" fill="var(--color-text-muted)" fontSize="9.5" textAnchor="middle">Jun</text>
          </svg>
        </div>
      </div>

      {/* Two Punchy Metric Cards */}
      <div className="edulearn-activity-tiles">
        {/* Yellow Card: 450K+ Completed Course */}
        <div className="edulearn-tile edulearn-tile--yellow">
          <div>
            <h4 className="edulearn-tile__value">450K+</h4>
            <span className="edulearn-tile__title">Completed Course</span>
            <span className="edulearn-tile__subtitle">This is the latest Data</span>
          </div>
          <div className="edulearn-tile__btn" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M5 19L19 5M19 5H9M19 5V15" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Pink Card: 200K+ Video Course */}
        <div className="edulearn-tile edulearn-tile--pink">
          <div>
            <h4 className="edulearn-tile__value">200K+</h4>
            <span className="edulearn-tile__title">Video Course</span>
            <span className="edulearn-tile__subtitle">Live &amp; Recorded</span>
          </div>
          <div className="edulearn-tile__btn" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

