'use client'

import type { App } from '@/types/app'
import { exportAppsAsJSON } from '@/lib/export'

interface ExportButtonProps {
  apps: App[]
}

export function ExportButton({ apps }: ExportButtonProps) {
  return (
    <button
      onClick={() => exportAppsAsJSON(apps)}
      className="px-4 py-2 rounded-lg glass-card border border-border
        text-white/50 font-mono text-sm hover:text-white/80 hover:border-border-hover
        transition-all duration-150 flex items-center gap-2"
      title="Export all apps as JSON"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Export JSON
    </button>
  )
}
