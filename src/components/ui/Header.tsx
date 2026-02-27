'use client'

import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { Logo } from './Logo'

interface HeaderProps {
  isAdmin?: boolean
}

export function Header({ isAdmin = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border backdrop-blur-md bg-background/80">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <Logo size={28} className="opacity-90 group-hover:opacity-100 transition-opacity" />
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

