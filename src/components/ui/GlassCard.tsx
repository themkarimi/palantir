'use client'

import { cn } from '@/lib/cn'

interface GlassCardProps {
  accentColor?: string
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export function GlassCard({
  accentColor,
  className,
  children,
  onClick,
}: GlassCardProps) {
  return (
    <div
      className={cn('glass-card relative overflow-hidden', className)}
      style={accentColor ? { borderTop: `2px solid ${accentColor}` } : undefined}
      onClick={onClick}
    >
      {/* Subtle top gradient glow from accent color */}
      {accentColor && (
        <div
          className="absolute inset-x-0 top-0 h-20 opacity-[0.08] pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, ${accentColor}, transparent)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
