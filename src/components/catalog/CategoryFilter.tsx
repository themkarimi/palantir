'use client'

import { useAppStore } from '@/store/useAppStore'
import { CATEGORIES, type Category } from '@/types/app'
import { cn } from '@/lib/cn'

const ALL_CATEGORIES: Array<Category | 'All'> = ['All', ...CATEGORIES]

export function CategoryFilter() {
  const { activeCategory, setActiveCategory } = useAppStore()

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <span className="font-mono text-[11px] text-white/30 uppercase tracking-wider hidden sm:block">
        Filter
      </span>
      {ALL_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat
        return (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150',
              'border',
              isActive
                ? 'bg-accent/10 border-accent/40 text-accent'
                : 'bg-surface border-border text-white/50 hover:text-white/80 hover:border-border-hover'
            )}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
