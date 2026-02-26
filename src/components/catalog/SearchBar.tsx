'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function SearchBar() {
  const ref = useRef<HTMLInputElement>(null)
  const { searchQuery, setSearchQuery } = useAppStore()

  // "/" focuses search; "Escape" clears and blurs
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        document.activeElement !== ref.current
      ) {
        e.preventDefault()
        ref.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Search icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>

      <input
        ref={ref}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setSearchQuery('')
            ref.current?.blur()
          }
        }}
        placeholder='Search apps by name or category...'
        className="w-full glass-card px-5 py-4 pl-11 pr-16 text-base outline-none
          focus:border-accent/50 focus:shadow-glow-sm transition-all duration-200
          placeholder:text-white/25 font-sans"
        aria-label="Search applications"
      />

      {/* "/" hint */}
      {!searchQuery && (
        <kbd
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs
            text-white/25 border border-white/10 rounded px-1.5 py-0.5 font-mono
            pointer-events-none hidden sm:block"
        >
          /
        </kbd>
      )}

      {/* Clear button */}
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40
            hover:text-white/70 transition-colors p-0.5"
          aria-label="Clear search"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      )}
    </div>
  )
}
