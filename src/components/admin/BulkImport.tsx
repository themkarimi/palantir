'use client'

import { useState } from 'react'
import type { App } from '@/types/app'
import { cn } from '@/lib/cn'

interface BulkImportProps {
  onImportDone: (apps: App[]) => void
}

type Format = 'json' | 'csv'

const JSON_EXAMPLE = `[
  {
    "name": "My Service",
    "url": "https://service.internal.company.com",
    "description": "Description of the service",
    "category": "CI/CD",
    "iconSlug": "github",
    "accentColor": "#24292e"
  }
]`

const CSV_EXAMPLE = `name,url,description,category,iconSlug,accentColor
My Service,https://service.internal.company.com,Description,CI/CD,github,#24292e`

export function BulkImport({ onImportDone }: BulkImportProps) {
  const [format, setFormat] = useState<Format>('json')
  const [data, setData] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImport = async () => {
    if (!data.trim()) {
      setError('Please paste your import data above.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/apps/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: data.trim(), format }),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        setError(result.error ?? 'Import failed')
      } else {
        setData('')
        onImportDone(result.data.apps)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="glass-card p-5 space-y-4">
        <h2 className="font-mono text-sm font-semibold text-white/80">
          Bulk Import Apps
        </h2>

        {/* Format selector */}
        <div className="flex gap-2">
          {(['json', 'csv'] as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => { setFormat(f); setData('') }}
              className={cn(
                'px-3 py-1.5 rounded-lg font-mono text-xs border transition-all',
                format === f
                  ? 'bg-accent/10 border-accent/40 text-accent'
                  : 'glass-card border-border text-white/40 hover:text-white/70'
              )}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Example */}
        <div>
          <p className="text-[11px] font-mono text-white/30 mb-2">
            Expected format ({format.toUpperCase()}):
          </p>
          <pre className="text-[11px] font-mono text-white/40 bg-black/20 rounded-lg p-3
            overflow-x-auto border border-border">
            {format === 'json' ? JSON_EXAMPLE : CSV_EXAMPLE}
          </pre>
        </div>

        {/* Textarea */}
        <div>
          <label className="block text-xs font-mono text-white/50 mb-1.5">
            Paste {format.toUpperCase()} data:
          </label>
          <textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            rows={10}
            className="input-base w-full resize-y font-mono text-xs"
            placeholder={`Paste your ${format.toUpperCase()} here...`}
            spellCheck={false}
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs font-mono bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={handleImport}
          disabled={loading || !data.trim()}
          className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/30
            text-accent font-mono text-sm hover:bg-accent/20 hover:border-accent/50
            transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Importing...' : 'Import Apps'}
        </button>
      </div>
    </div>
  )
}
