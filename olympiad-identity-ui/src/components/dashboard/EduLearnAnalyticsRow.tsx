export function EduLearnAnalyticsRow() {
  return (
    <div className="edulearn-analytics-row">
      {/* 1. Top 5 School Performance Multi-Bar Chart */}
      <div className="edulearn-card">
        <h3 className="edulearn-card__title">Top 5 School Performance</h3>

        {/* Legend */}
        <div className="edulearn-bar-legend" aria-hidden="true">
          <span className="edulearn-legend-item">
            <span
              className="edulearn-legend-dot"
              style={{ backgroundColor: "#0284c7" }}
            />
            Cambridge High
          </span>
          <span className="edulearn-legend-item">
            <span
              className="edulearn-legend-dot"
              style={{ backgroundColor: "#8b5cf6" }}
            />
            Oxford Academy
          </span>
          <span className="edulearn-legend-item">
            <span
              className="edulearn-legend-dot"
              style={{ backgroundColor: "#10b981" }}
            />
            Olympiad Core
          </span>
          <span className="edulearn-legend-item">
            <span
              className="edulearn-legend-dot"
              style={{ backgroundColor: "#f43f5e" }}
            />
            Global STEM
          </span>
          <span className="edulearn-legend-item">
            <span
              className="edulearn-legend-dot"
              style={{ backgroundColor: "#f59e0b" }}
            />
            Elite Scholars
          </span>
        </div>

        {/* Bar chart SVG */}
        <div className="edulearn-chart-wrapper" aria-hidden="true">
          <svg
            viewBox="0 0 340 180"
            className="edulearn-bars-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Grid lines */}
            <line
              x1="30"
              y1="20"
              x2="330"
              y2="20"
              stroke="var(--color-border)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <text x="5" y="24" fill="var(--color-text-muted)" fontSize="9">
              100%
            </text>

            <line
              x1="30"
              y1="50"
              x2="330"
              y2="50"
              stroke="var(--color-border)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <text x="10" y="54" fill="var(--color-text-muted)" fontSize="9">
              80%
            </text>

            <line
              x1="30"
              y1="80"
              x2="330"
              y2="80"
              stroke="var(--color-border)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <text x="10" y="84" fill="var(--color-text-muted)" fontSize="9">
              60%
            </text>

            <line
              x1="30"
              y1="110"
              x2="330"
              y2="110"
              stroke="var(--color-border)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <text x="10" y="114" fill="var(--color-text-muted)" fontSize="9">
              40%
            </text>

            <line
              x1="30"
              y1="140"
              x2="330"
              y2="140"
              stroke="var(--color-border)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            <text x="10" y="144" fill="var(--color-text-muted)" fontSize="9">
              20%
            </text>

            <line
              x1="30"
              y1="160"
              x2="330"
              y2="160"
              stroke="var(--color-border)"
              strokeWidth="1.2"
            />
            <text x="15" y="164" fill="var(--color-text-muted)" fontSize="9">
              0%
            </text>

            {/* 5 Distinct Bars */}
            {/* Bar 1: 82% */}
            <rect x="55" y="36" width="32" height="124" rx="4" fill="#0284c7" />
            {/* Bar 2: 66% */}
            <rect
              x="115"
              y="60"
              width="32"
              height="100"
              rx="4"
              fill="#8b5cf6"
            />
            {/* Bar 3: 60% */}
            <rect x="175" y="70" width="32" height="90" rx="4" fill="#10b981" />
            {/* Bar 4: 52% */}
            <rect x="235" y="82" width="32" height="78" rx="4" fill="#f43f5e" />
            {/* Bar 5: 42% */}
            <rect x="295" y="98" width="32" height="62" rx="4" fill="#f59e0b" />
          </svg>
        </div>
      </div>

      {/* 2. Overall Pass Percentage Donut Chart */}
      <div className="edulearn-card">
        <h3 className="edulearn-card__title">Overall Pass Percentage</h3>

        <div className="edulearn-donut-wrapper" aria-hidden="true">
          <svg
            viewBox="0 0 160 160"
            width="130"
            height="130"
            className="edulearn-donut-svg"
          >
            <circle
              cx="80"
              cy="80"
              r="58"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="20"
              strokeDasharray="364.4"
              strokeDashoffset="110"
              transform="rotate(-90 80 80)"
            />
            <circle
              cx="80"
              cy="80"
              r="58"
              fill="none"
              stroke="#0284c7"
              strokeWidth="20"
              strokeDasharray="364.4"
              strokeDashoffset="254.4"
              transform="rotate(60 80 80)"
            />
          </svg>
          <div className="edulearn-donut-label">
            <span className="edulearn-donut-num">88.5%</span>
            <span className="edulearn-donut-text">Passed</span>
          </div>
        </div>

        {/* Legend */}
        <div className="edulearn-donut-legend">
          <span className="edulearn-legend-item">
            <span
              className="edulearn-legend-dot"
              style={{ backgroundColor: "#0284c7" }}
            />
            Maths Track
          </span>
          <span className="edulearn-legend-item">
            <span
              className="edulearn-legend-dot"
              style={{ backgroundColor: "#8b5cf6" }}
            />
            Science Track
          </span>
        </div>
      </div>

      {/* 3. Content Usage & Growth Sparkline */}
      <div className="edulearn-card">
        <div className="edulearn-card__header">
          <h3 className="edulearn-card__title">Content Usage</h3>
        </div>
        <span className="edulearn-growth-badge">
          12.5% higher than last month
        </span>

        <div className="edulearn-chart-wrapper" aria-hidden="true">
          <svg
            viewBox="0 0 240 100"
            className="edulearn-sparkline-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline
              points="15,75 40,45 65,70 90,40 115,55 140,48 165,65 190,52 215,40 230,30"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Milestone dots */}
            <circle cx="15" cy="75" r="3" fill="#0284c7" />
            <circle cx="40" cy="45" r="3" fill="#0284c7" />
            <circle cx="65" cy="70" r="3" fill="#0284c7" />
            <circle cx="90" cy="40" r="3" fill="#0284c7" />
            <circle cx="115" cy="55" r="3" fill="#0284c7" />
            <circle cx="140" cy="48" r="3" fill="#0284c7" />
            <circle cx="165" cy="65" r="3" fill="#0284c7" />
            <circle cx="190" cy="52" r="3" fill="#0284c7" />
            <circle cx="215" cy="40" r="3" fill="#0284c7" />
            <circle cx="230" cy="30" r="3.5" fill="#f59e0b" />
          </svg>
        </div>
      </div>
    </div>
  );
}
