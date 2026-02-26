import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readApps, writeApps } from '@/lib/db'
import type { AppUpdateInput } from '@/types/app'

async function isAuthorized(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('palantir_token')?.value
  if (!token) return false
  return (await verifyToken(token)) !== null
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const apps = await readApps()
  const app = apps.find((a) => a.id === id)
  if (!app) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: app })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const body: AppUpdateInput = await request.json()
    const apps = await readApps()
    const idx = apps.findIndex((a) => a.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    const updated = { ...apps[idx], ...body, id }
    apps[idx] = updated
    await writeApps(apps)
    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update app' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  try {
    const apps = await readApps()
    const filtered = apps.filter((a) => a.id !== id)
    if (filtered.length === apps.length) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    await writeApps(filtered)
    return NextResponse.json({ success: true, data: { id } })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete app' },
      { status: 500 }
    )
  }
}
