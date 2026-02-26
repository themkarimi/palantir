import { create } from 'zustand'
import type { App, Category } from '@/types/app'

interface AppStore {
  apps: App[]
  searchQuery: string
  activeCategory: Category | 'All'
  isLoading: boolean
  setApps: (apps: App[]) => void
  setSearchQuery: (q: string) => void
  setActiveCategory: (cat: Category | 'All') => void
  setLoading: (loading: boolean) => void
  filteredApps: () => App[]
}

export const useAppStore = create<AppStore>((set, get) => ({
  apps: [],
  searchQuery: '',
  activeCategory: 'All',
  isLoading: false,
  setApps: (apps) => set({ apps }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setLoading: (loading) => set({ isLoading: loading }),
  filteredApps: () => {
    const { apps, searchQuery, activeCategory } = get()
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

    return result
  },
}))
