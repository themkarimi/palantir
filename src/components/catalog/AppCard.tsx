'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { AppLogo } from '@/components/ui/AppLogo'
import { StatusDot } from './StatusDot'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { useRecentStore } from '@/store/useRecentStore'
import { useClipboard } from '@/hooks/useClipboard'
import type { App } from '@/types/app'
import { cn } from '@/lib/cn'

interface AppCardProps {
  app: App
  index: number
}

export function AppCard({ app, index }: AppCardProps) {
  const { toggle, isFavorite } = useFavoritesStore()
  const { addRecent } = useRecentStore()
  const { copy } = useClipboard()
  const favorite = isFavorite(app.id)

  const handleOpen = () => {
    addRecent(app.id)
    window.open(app.url, '_blank', 'noopener,noreferrer')
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    copy(app.url, `Copied URL for ${app.name}`)
  }

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggle(app.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.5), duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      layout
      layoutId={app.id}
    >
      <GlassCard
        accentColor={app.accentColor}
        className={cn(
          'p-5 h-full cursor-pointer group',
          'hover:border-border-hover transition-all duration-300',
          'hover:shadow-glow hover:shadow-[0_0_24px_rgba(0,0,0,0.5)]'
        )}
        onClick={handleOpen}
      >
        {/* Top row: logo + status + star */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <AppLogo
              name={app.name}
              iconSlug={app.iconSlug}
              customLogoUrl={app.customLogoUrl}
              accentColor={app.accentColor}
              size={36}
            />
            <div>
              {/* Category chip */}
              <span
                className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-full border"
                style={{
                  color: app.accentColor,
                  borderColor: `${app.accentColor}40`,
                  backgroundColor: `${app.accentColor}12`,
                }}
              >
                {app.category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <StatusDot appId={app.id} />
            <button
              onClick={handleStar}
              title={favorite ? 'Remove from favorites' : 'Add to favorites'}
              className={cn(
                'p-1 rounded transition-all duration-150',
                favorite
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100'
              )}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={favorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* App name */}
        <h3 className="font-mono text-sm font-semibold text-white/90 mb-1 truncate group-hover:text-white transition-colors">
          {app.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-white/45 font-sans leading-relaxed mb-4 line-clamp-2">
          {app.description}
        </p>

        {/* Bottom: URL + copy button */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="text-[11px] font-mono text-white/25 truncate flex-1 min-w-0">
            {new URL(app.url).hostname}
          </span>
          <button
            onClick={handleCopy}
            title="Copy URL"
            className="p-1.5 rounded-md glass-card opacity-0 group-hover:opacity-100
              transition-all duration-150 text-white/40 hover:text-accent hover:border-accent/30
              flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          </button>
        </div>
      </GlassCard>
    </motion.div>
  )
}
