import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readApps, writeApps } from '@/lib/db'

async function isAuthorized(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('palantir_token')?.value
  if (!token) return false
  return (await verifyToken(token)) !== null
}

export async function PATCH(request: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { ids }: { ids: string[] } = await request.json()
    if (!Array.isArray(ids)) {
      return NextResponse.json(
        { success: false, error: 'ids must be an array' },
        { status: 400 }
      )
    }

    const apps = await readApps()
    const idToApp = new Map(apps.map((a) => [a.id, a]))

    const reordered = ids
      .filter((id) => idToApp.has(id))
      .map((id, idx) => ({ ...idToApp.get(id)!, order: idx }))

    // Preserve any apps not included in the reorder (shouldn't happen but safety)
    const reorderedIds = new Set(ids)
    const untouched = apps
      .filter((a) => !reorderedIds.has(a.id))
      .map((a, i) => ({ ...a, order: reordered.length + i }))

    const final = [...reordered, ...untouched]
    await writeApps(final)
    return NextResponse.json({ success: true, data: final })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to reorder apps' },
      { status: 500 }
    )
  }
}
