'use client'

import { cn } from '@/lib/cn'

interface EmptyStateProps {
  title?: string
  description?: string
  className?: string
}

export function EmptyState({
  title = 'No apps found',
  description = 'Try adjusting your search or filter.',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-20 text-center',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-white/20"
        >
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
          <path d="M8 11h6M11 8v6"/>
        </svg>
      </div>
      <p className="font-mono text-sm text-white/60">{title}</p>
      <p className="text-xs text-white/30 mt-1 font-sans">{description}</p>
    </div>
  )
}
