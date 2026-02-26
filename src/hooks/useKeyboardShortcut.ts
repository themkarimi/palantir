'use client'

import { useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'

/**
 * Returns a ref to attach to the search input. Registers:
 * - "/" key: focuses the search input (if not already focused)
 * - "Escape" key: clears the query and blurs
 */
export function useSearchInput() {
  const ref = useRef<HTMLInputElement>(null)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchQuery('')
      ref.current?.blur()
    }
  }

  return { ref, onKeyDown }
}
