import React from 'react'

interface LogoProps {
  className?: string
  /** Show just the icon without the wordmark */
  iconOnly?: boolean
  size?: number
}

/**
 * Palantir logo — minimalist flat orb icon optionally paired with the wordmark.
 */
export function Logo({ className = '', iconOnly = false, size = 28 }: LogoProps) {
  const totalWidth = iconOnly ? size : size + size * 4.2
  const cx = size / 2
  const cy = size / 2
  const rOuter = size / 2 - size * 0.04
  const rMid = rOuter * 0.6
  const rDot = size * 0.09

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalWidth} ${size}`}
      height={size}
      width={iconOnly ? size : undefined}
      className={className}
      aria-label="Palantir"
      fill="none"
    >
      {/* ── Orb icon ── */}
      <circle cx={cx} cy={cy} r={rOuter} stroke="#00e5ff" strokeWidth={size * 0.054} />
      <circle cx={cx} cy={cy} r={rMid} stroke="#00e5ff" strokeWidth={size * 0.036} strokeOpacity="0.4" />
      <circle cx={cx} cy={cy} r={rDot} fill="#00e5ff" />

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
