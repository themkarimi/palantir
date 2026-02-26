'use client'

import { useStatusStore, type PingStatus } from '@/store/useStatusStore'
import { cn } from '@/lib/cn'

interface StatusDotProps {
  appId: string
}

const statusConfig: Record<PingStatus, { bg: string; ping: boolean; label: string }> = {
  online: { bg: 'bg-green-400', ping: true, label: 'Online' },
  offline: { bg: 'bg-red-500', ping: false, label: 'Offline' },
  unknown: { bg: 'bg-white/20', ping: false, label: 'Unknown' },
}

export function StatusDot({ appId }: StatusDotProps) {
  const status = useStatusStore((s) => s.statuses[appId] ?? 'unknown')
  const { bg, ping, label } = statusConfig[status]

  return (
    <span
      title={`Status: ${label} (CORS-based reachability check)`}
      className="relative flex h-2.5 w-2.5 flex-shrink-0"
    >
      {ping && (
        <span
          className={cn(
            'animate-ping-slow absolute inline-flex h-full w-full rounded-full opacity-75',
            bg
          )}
        />
      )}
      <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5', bg)} />
    </span>
  )
}
