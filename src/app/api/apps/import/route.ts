import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readApps, writeApps } from '@/lib/db'
import { parseCSVToApps, parseJSONToApps } from '@/lib/csv'
import { v4 as uuidv4 } from 'uuid'
import type { App } from '@/types/app'

async function isAuthorized(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('palantir_token')?.value
  if (!token) return false
  return (await verifyToken(token)) !== null
}

export async function POST(request: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, format }: { data: string; format: 'json' | 'csv' } = await request.json()

    let parsed: Omit<App, 'id' | 'order' | 'createdAt'>[]
    if (format === 'csv') {
      parsed = parseCSVToApps(data)
    } else {
      parsed = parseJSONToApps(data)
    }

    if (parsed.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid apps found in import data' },
        { status: 400 }
      )
    }

    const existing = await readApps()
    const maxOrder = existing.length > 0 ? Math.max(...existing.map((a) => a.order)) : -1

    const newApps: App[] = parsed.map((item, idx) => ({
      ...item,
      id: uuidv4(),
      order: maxOrder + idx + 1,
      createdAt: new Date().toISOString(),
    }))

    await writeApps([...existing, ...newApps])
    return NextResponse.json({
      success: true,
      data: { imported: newApps.length, apps: newApps },
    })
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to import apps',
      },
      { status: 400 }
    )
  }
}
