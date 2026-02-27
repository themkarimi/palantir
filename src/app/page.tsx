import { cookies } from 'next/headers'
import { readApps } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { CatalogClient } from './CatalogClient'

// Always fetch fresh data — no ISR caching for a live platform dashboard
export const dynamic = 'force-dynamic'

/** Normalise a group name by stripping a leading slash. */
function normalizeGroup(g: string): string {
  return g.replace(/^\//, '')
}

export default async function HomePage() {
  const allApps = await readApps()

  // Resolve the user's groups from the session cookie (set by OIDC login).
  const cookieStore = await cookies()
  const token = cookieStore.get('palantir_token')?.value
  let userGroups: string[] = []
  if (token) {
    const payload = await verifyToken(token)
    if (payload && Array.isArray(payload['groups'])) {
      userGroups = (payload['groups'] as unknown[])
        .filter((g) => typeof g === 'string' && g.trim() !== '')
        .map((g) => normalizeGroup(String(g)))
    }
  }

  // Filter: apps with no team restriction are visible to everyone.
  // Apps with team restrictions are only visible to users belonging to one of those teams.
  const apps = allApps.filter((app) => {
    if (!app.teams || app.teams.length === 0) return true
    if (userGroups.length === 0) return false
    return app.teams.some((t) => userGroups.includes(normalizeGroup(t)))
  })

  return <CatalogClient initialApps={apps} />
}
