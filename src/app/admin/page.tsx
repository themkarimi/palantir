import { readApps } from '@/lib/db'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const apps = await readApps()
  return <AdminDashboard initialApps={apps} />
}
