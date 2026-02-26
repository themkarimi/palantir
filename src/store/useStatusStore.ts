import { create } from 'zustand'

export type PingStatus = 'unknown' | 'online' | 'offline'

interface StatusStore {
  statuses: Record<string, PingStatus>
  setStatus: (id: string, status: PingStatus) => void
  clearStatuses: () => void
}

export const useStatusStore = create<StatusStore>((set) => ({
  statuses: {},
  setStatus: (id, status) =>
    set((s) => ({ statuses: { ...s.statuses, [id]: status } })),
  clearStatuses: () => set({ statuses: {} }),
}))
