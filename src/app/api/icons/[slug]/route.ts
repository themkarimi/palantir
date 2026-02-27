import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_FILE = path.resolve(
  process.cwd(),
  process.env.DATA_FILE_PATH ?? './data/apps.json'
)
const ICONS_DIR = path.join(path.dirname(DATA_FILE), 'icons')

const CDN_BASE = 'https://cdn.simpleicons.org'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Sanitize: only allow alphanumeric, hyphens, and underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
    return new NextResponse('Invalid icon slug', { status: 400 })
  }

  const iconPath = path.join(ICONS_DIR, `${slug}.svg`)

  // Try to serve from local cache first
  try {
    const cached = await fs.readFile(iconPath, 'utf-8')
    return new NextResponse(cached, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
    })
  } catch {
    // Not cached yet — fall through to fetch from CDN
  }

  // Fetch from Simple Icons CDN
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    let response: Response
    try {
      response = await fetch(`${CDN_BASE}/${slug}`, { signal: controller.signal })
    } finally {
      clearTimeout(timeout)
    }
    if (!response.ok) {
      return new NextResponse('Icon not found', { status: 404 })
    }
    const svg = await response.text()

    // Basic SVG validation: must contain an <svg element
    if (!svg.includes('<svg')) {
      return new NextResponse('Invalid icon content', { status: 502 })
    }

    // Persist to data/icons/
    try {
      await fs.mkdir(ICONS_DIR, { recursive: true })
      await fs.writeFile(iconPath, svg, 'utf-8')
    } catch {
      // Non-fatal: cache write failure doesn't prevent serving the icon
    }

    return new NextResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
    })
  } catch {
    return new NextResponse('Failed to fetch icon', { status: 502 })
  }
}
