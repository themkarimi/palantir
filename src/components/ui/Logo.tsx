import React from 'react'

interface LogoProps {
  className?: string
  /** Show just the icon without the wordmark */
  iconOnly?: boolean
  size?: number
}

/**
 * Palantir logo — a seeing-stone orb icon optionally paired with the wordmark.
 */
export function Logo({ className = '', iconOnly = false, size = 28 }: LogoProps) {
  const textHeight = size
  const totalWidth = iconOnly ? size : size + size * 4.2

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalWidth} ${textHeight}`}
      height={size}
      width={iconOnly ? size : undefined}
      className={className}
      aria-label="Palantir"
      fill="none"
    >
      <defs>
        <radialGradient id="logo-orb-bg" cx="42%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#0d0f14" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0d0f14" />
        </radialGradient>
        <filter id="logo-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="logo-core-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Orb icon ── */}
      {(() => {
        const cx = size / 2
        const cy = size / 2
        const r = size / 2 - 0.8
        return (
          <g>
            {/* Background */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="url(#logo-orb-bg)"
              stroke="#00e5ff"
              strokeWidth={size * 0.055}
              filter="url(#logo-glow)"
            />
            {/* Middle ring */}
            <circle
              cx={cx}
              cy={cy}
              r={r * 0.62}
              fill="none"
              stroke="#00e5ff"
              strokeWidth={size * 0.035}
              strokeOpacity="0.5"
            />
            {/* Inner ring */}
            <circle
              cx={cx}
              cy={cy}
              r={r * 0.32}
              fill="none"
              stroke="#00e5ff"
              strokeWidth={size * 0.03}
              strokeOpacity="0.75"
            />
            {/* Core */}
            <circle
              cx={cx}
              cy={cy}
              r={r * 0.13}
              fill="#00e5ff"
              filter="url(#logo-core-glow)"
            />
            {/* Highlight glint */}
            <circle
              cx={cx - r * 0.28}
              cy={cy - r * 0.28}
              r={r * 0.1}
              fill="#ffffff"
              fillOpacity="0.28"
            />
          </g>
        )
      })()}

      {/* ── Wordmark ── */}
      {!iconOnly && (
        <text
          x={size + size * 0.45}
          y={size * 0.72}
          fontFamily="'JetBrains Mono', 'Courier New', monospace"
          fontSize={size * 0.62}
          fontWeight="600"
          letterSpacing={size * 0.055}
          fill="#ffffff"
        >
          PALANTIR
        </text>
      )}
    </svg>
  )
}
