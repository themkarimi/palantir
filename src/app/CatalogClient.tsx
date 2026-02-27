'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useStatusPing } from '@/hooks/useStatusPing'
import { Header } from '@/components/ui/Header'
import { Logo } from '@/components/ui/Logo'
import { SearchBar } from '@/components/catalog/SearchBar'
import { CategoryFilter } from '@/components/catalog/CategoryFilter'
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
        <div className="text-center space-y-3 pt-4 flex flex-col items-center">
          <Logo size={56} iconOnly className="drop-shadow-[0_0_16px_rgba(0,229,255,0.4)]" />
          <h1 className="font-mono text-4xl font-bold tracking-tight">
            <span className="text-accent">palantir</span>
          </h1>
        </div>

        {/* Search */}
        <SearchBar />

        {/* Filters */}
        <CategoryFilter />

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
