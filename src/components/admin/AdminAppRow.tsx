'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { App } from '@/types/app'
import { AppLogo } from '@/components/ui/AppLogo'
import { cn } from '@/lib/cn'

interface AdminAppRowProps {
  app: App
  onEdit: () => void
  onDelete: () => void
}

export function AdminAppRow({ app, onEdit, onDelete }: AdminAppRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-4 p-3 rounded-xl glass-card',
        'border hover:border-border-hover transition-all duration-150',
        isDragging && 'opacity-50 shadow-glow-sm z-50'
      )}
    >
      {/* Drag handle */}
      <button
        className="text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing
          flex-shrink-0 p-1"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="4" r="1" fill="currentColor"/>
          <circle cx="15" cy="4" r="1" fill="currentColor"/>
          <circle cx="9" cy="10" r="1" fill="currentColor"/>
          <circle cx="15" cy="10" r="1" fill="currentColor"/>
          <circle cx="9" cy="16" r="1" fill="currentColor"/>
          <circle cx="15" cy="16" r="1" fill="currentColor"/>
        </svg>
      </button>

      {/* App logo */}
      <AppLogo
        name={app.name}
        iconSlug={app.iconSlug}
        customLogoUrl={app.customLogoUrl}
        accentColor={app.accentColor}
        size={28}
      />

      {/* App info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-white/90 font-medium">
            {app.name}
          </span>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
            style={{
              color: app.accentColor,
              backgroundColor: `${app.accentColor}18`,
            }}
          >
            {app.category}
          </span>
        </div>
        <p className="text-xs text-white/30 font-sans truncate">
          {app.url}
        </p>
      </div>

      {/* Accent swatch */}
      <div
        className="w-4 h-4 rounded-full flex-shrink-0 border border-white/10"
        style={{ backgroundColor: app.accentColor }}
        title={`Accent: ${app.accentColor}`}
      />

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5
            transition-all duration-150"
          title="Edit"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-900/20
            transition-all duration-150"
          title="Delete"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
