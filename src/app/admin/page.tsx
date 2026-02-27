import { readApps, readUsersData } from '@/lib/db'
import { isOidcEnabled } from '@/lib/oidc'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [apps, usersData] = await Promise.all([readApps(), readUsersData()])
  // Strip password hashes before sending to client
  const safeUsers = usersData.users.map(({ passwordHash: _, ...rest }) => rest)
  return (
    <AdminDashboard
      initialApps={apps}
      initialUsers={safeUsers}
      initialGroups={usersData.groups}
      oidcEnabled={isOidcEnabled()}
      oidcAdminGroup={process.env.OIDC_ADMIN_GROUP ?? null}
    />
  )
}
