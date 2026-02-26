import { readApps } from '@/lib/db'
import { CatalogClient } from './CatalogClient'

// Always fetch fresh data — no ISR caching for a live platform dashboard
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const apps = await readApps()
  return <CatalogClient initialApps={apps} />
}
