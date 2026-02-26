'use client'

import { useMemo, useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { useFavoritesStore } from '@/store/useFavoritesStore'
import { AppCard } from './AppCard'
import { EmptyState } from '@/components/ui/EmptyState'

export function AppGrid() {
  // Read primitive values — stable references, no infinite-loop risk
  const apps = useAppStore((s) => s.apps)
  const searchQuery = useAppStore((s) => s.searchQuery)
  const activeCategory = useAppStore((s) => s.activeCategory)
  const { favoriteIds } = useFavoritesStore()

  // Hydration guard for localStorage-backed favorites store
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const effectiveFavorites = mounted ? favoriteIds : []

  // Compute filtered + sorted result — only recalculates when inputs change
  const sorted = useMemo(() => {
    let result = [...apps]

    if (activeCategory !== 'All') {
      result = result.filter((a) => a.category === activeCategory)
    }

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      )
    }

    // Favorites float to top
    return [
      ...result.filter((a) => effectiveFavorites.includes(a.id)),
      ...result.filter((a) => !effectiveFavorites.includes(a.id)),
    ]
  }, [apps, searchQuery, activeCategory, effectiveFavorites])

  if (sorted.length === 0) {
    return (
      <EmptyState
        title="No apps found"
        description="Try a different search or select a different category."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <AnimatePresence mode="popLayout">
        {sorted.map((app, i) => (
          <AppCard key={app.id} app={app} index={i} />
        ))}
      </AnimatePresence>
    </div>
  )
}
