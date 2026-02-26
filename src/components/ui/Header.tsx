'use client'

import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  isAdmin?: boolean
}

export function Header({ isAdmin = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border backdrop-blur-md bg-background/80">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          {/* Palantir "eye" icon */}
          <div className="w-7 h-7 rounded-md bg-accent/10 border border-accent/30 flex items-center justify-center group-hover:border-accent/60 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <span className="font-mono text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
            palantir
          </span>
          <span className="hidden sm:block text-white/20 text-xs font-mono">
            / dev platform
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAdmin ? (
            <Link
              href="/"
              className="text-xs font-mono text-white/50 hover:text-white/80 transition-colors
                px-3 py-1.5 rounded-lg border border-border hover:border-border-hover"
            >
              ← catalog
            </Link>
          ) : (
            <Link
              href="/admin"
              className="text-xs font-mono text-white/50 hover:text-white/80 transition-colors
                px-3 py-1.5 rounded-lg border border-border hover:border-border-hover"
            >
              admin
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
