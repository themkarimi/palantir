'use client'

import { useState } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'

interface AppLogoProps {
  name: string
  iconSlug?: string
  customLogoUrl?: string | null
  accentColor?: string
  size?: number
  className?: string
}

export function AppLogo({
  name,
  iconSlug,
  customLogoUrl,
  accentColor,
  size = 40,
  className,
}: AppLogoProps) {
  const [error, setError] = useState(false)
  const { theme } = useTheme()

  const src = customLogoUrl || (iconSlug ? `https://cdn.simpleicons.org/${iconSlug}` : null)

  const initials = name
    .split(/[\s-_]+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (src && !error) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${name} logo`}
        width={size}
        height={size}
        onError={() => setError(true)}
        className={className}
        style={{
          objectFit: 'contain',
          width: size,
          height: size,
          // Simple Icons serves black SVGs — invert to white in dark mode
          filter: theme === 'dark' ? 'invert(1) brightness(0.9)' : 'none',
        }}
      />
    )
  }

  // Initials fallback avatar
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: accentColor ?? '#00e5ff',
        fontSize: Math.round(size * 0.38),
        flexShrink: 0,
      }}
      className={`rounded-lg flex items-center justify-center font-mono font-bold text-white select-none ${className ?? ''}`}
    >
      {initials || '?'}
    </div>
  )
}
