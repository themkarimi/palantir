'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useStatusPing } from '@/hooks/useStatusPing'
import { Header } from '@/components/ui/Header'
import { SearchBar } from '@/components/catalog/SearchBar'
import { CategoryFilter } from '@/components/catalog/CategoryFilter'
import { RecentlyVisited } from '@/components/catalog/RecentlyVisited'
import { AppGrid } from '@/components/catalog/AppGrid'
import type { App } from '@/types/app'

interface CatalogClientProps {
  initialApps: App[]
}

export function CatalogClient({ initialApps }: CatalogClientProps) {
  const setApps = useAppStore((s) => s.setApps)

  useEffect(() => {
    setApps(initialApps)
  }, [initialApps, setApps])

  useStatusPing(initialApps)

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3 pt-4">
          <h1 className="font-mono text-4xl font-bold tracking-tight">
            <span className="text-accent">palantir</span>
            <span className="text-white/20"> // </span>
            <span className="text-white/60 text-2xl">dev platform</span>
          </h1>
          <p className="text-white/35 font-sans text-sm max-w-md mx-auto">
            Central hub for all internal tools and services. Click to open, star to pin, <kbd className="px-1 py-0.5 text-[10px] border border-white/15 rounded font-mono">/</kbd> to search.
          </p>
        </div>

        {/* Search */}
        <SearchBar />

        {/* Filters */}
        <CategoryFilter />

        {/* Recently Visited */}
        <RecentlyVisited />

        {/* App Grid */}
        <AppGrid />

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center">
          <p className="text-white/15 text-[11px] font-mono">
            {initialApps.length} services registered
          </p>
        </footer>
      </main>
    </div>
  )
}
