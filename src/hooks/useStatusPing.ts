'use client'

import { useEffect } from 'react'
import { useStatusStore } from '@/store/useStatusStore'
import type { App } from '@/types/app'

/**
 * Pings all app URLs on component mount using a HEAD request with no-cors mode.
 *
 * Note: CORS restrictions prevent reading the response from internal services.
 * `mode: 'no-cors'` sends the request — if it resolves without error the service
 * is considered online; any error (network unreachable, timeout, etc.) marks it
 * offline. This is a best-effort reachability indicator, not a guaranteed health check.
 */
export function useStatusPing(apps: App[]) {
  const setStatus = useStatusStore((s) => s.setStatus)

  useEffect(() => {
    if (apps.length === 0) return

    const pingAll = async () => {
      await Promise.allSettled(
        apps.map(async (app) => {
          const url = app.healthCheckUrl ?? app.url
          const ctrl = new AbortController()
          const timeout = setTimeout(() => ctrl.abort(), 5000)

          try {
            await fetch(url, {
              method: 'HEAD',
              mode: 'no-cors',
              signal: ctrl.signal,
            })
            clearTimeout(timeout)
            setStatus(app.id, 'online')
          } catch {
            clearTimeout(timeout)
            setStatus(app.id, 'offline')
          }
        })
      )
    }

    pingAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps.length])
}
