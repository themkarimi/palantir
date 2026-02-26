'use client'

import { useState, useEffect } from 'react'
import { useRecentStore } from '@/store/useRecentStore'
import { useAppStore } from '@/store/useAppStore'
import { AppLogo } from '@/components/ui/AppLogo'

export function RecentlyVisited() {
  const { recentIds, addRecent } = useRecentStore()
  const apps = useAppStore((s) => s.apps)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted || recentIds.length === 0) return null

  const recentApps = recentIds
    .map((id) => apps.find((a) => a.id === id))
    .filter(Boolean) as typeof apps

  if (recentApps.length === 0) return null

  return (
    <div>
      <p className="font-mono text-[11px] text-white/30 uppercase tracking-wider mb-3">
        Recently Visited
      </p>
      <div className="flex gap-2 flex-wrap">
        {recentApps.map((app) => (
          <button
            key={app.id}
            onClick={() => {
              addRecent(app.id)
              window.open(app.url, '_blank', 'noopener,noreferrer')
            }}
            title={app.url}
            className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card
              border hover:border-border-hover text-white/60 hover:text-white/90
              transition-all duration-150 text-xs font-mono"
          >
            <AppLogo
              name={app.name}
              iconSlug={app.iconSlug}
              customLogoUrl={app.customLogoUrl}
              accentColor={app.accentColor}
              size={16}
            />
            <span>{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
