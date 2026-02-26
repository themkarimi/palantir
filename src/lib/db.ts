import fs from 'fs/promises'
import path from 'path'
import type { App } from '@/types/app'

const DATA_PATH = path.resolve(
  process.cwd(),
  process.env.DATA_FILE_PATH ?? './data/apps.json'
)

export async function readApps(): Promise<App[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8')
    const apps: App[] = JSON.parse(raw)
    return apps.sort((a, b) => a.order - b.order)
  } catch {
    return []
  }
}

/**
 * Atomic write: write to .tmp then rename to prevent corruption
 * on concurrent requests or process crash mid-write.
 */
export async function writeApps(apps: App[]): Promise<void> {
  const tmp = DATA_PATH + '.tmp'
  await fs.writeFile(tmp, JSON.stringify(apps, null, 2), 'utf-8')
  await fs.rename(tmp, DATA_PATH)
}
