import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readApps, writeApps } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import type { App, AppCreateInput } from '@/types/app'

export async function GET() {
  try {
    const apps = await readApps()
    return NextResponse.json({ success: true, data: apps })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to read apps' },
      { status: 500 }
    )
  }
}

async function isAuthorized(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('palantir_token')?.value
  if (!token) return false
  const payload = await verifyToken(token)
  return payload !== null
}

export async function POST(request: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: AppCreateInput = await request.json()
    const apps = await readApps()
    const maxOrder = apps.length > 0 ? Math.max(...apps.map((a) => a.order)) : -1

    const newApp: App = {
      id: uuidv4(),
      name: body.name,
      url: body.url,
      description: body.description ?? '',
      category: body.category,
      iconSlug: body.iconSlug ?? '',
      customLogoUrl: body.customLogoUrl ?? null,
      accentColor: body.accentColor ?? '#00e5ff',
      healthCheckUrl: body.healthCheckUrl ?? null,
      teams: Array.isArray(body.teams)
        ? body.teams.filter((t) => typeof t === 'string' && t.trim() !== '').map((t) => t.trim())
        : [],
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
    }

    await writeApps([...apps, newApp])
    return NextResponse.json({ success: true, data: newApp }, { status: 201 })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create app' },
      { status: 500 }
    )
  }
}
