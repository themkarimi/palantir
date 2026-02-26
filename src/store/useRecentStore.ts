import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecentStore {
  recentIds: string[]
  addRecent: (id: string) => void
  clearRecent: () => void
}

export const useRecentStore = create<RecentStore>()(
  persist(
    (set) => ({
      recentIds: [],
      addRecent: (id) =>
        set((s) => ({
          recentIds: [id, ...s.recentIds.filter((x) => x !== id)].slice(0, 5),
        })),
      clearRecent: () => set({ recentIds: [] }),
    }),
    { name: 'palantir-recent' }
  )
)
