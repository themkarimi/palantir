import fs from 'fs/promises'
import path from 'path'
import type { App } from '@/types/app'
import type { UsersData } from '@/types/user'

const DATA_PATH = path.resolve(
  process.cwd(),
  process.env.DATA_FILE_PATH ?? './data/apps.json'
)

const USERS_PATH = path.resolve(
  process.cwd(),
  process.env.USERS_FILE_PATH ?? './data/users.json'
)

const EMPTY_USERS: UsersData = { users: [], groups: [] }

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
async function writeFileAtomic(filePath: string, content: string): Promise<void> {
  const tmp = filePath + '.tmp'
  await fs.writeFile(tmp, content, 'utf-8')
  await fs.rename(tmp, filePath)
}

export async function writeApps(apps: App[]): Promise<void> {
  await writeFileAtomic(DATA_PATH, JSON.stringify(apps, null, 2))
}

export async function readUsersData(): Promise<UsersData> {
  try {
    const raw = await fs.readFile(USERS_PATH, 'utf-8')
    return JSON.parse(raw) as UsersData
  } catch {
    return { ...EMPTY_USERS }
  }
}

export async function writeUsersData(data: UsersData): Promise<void> {
  await writeFileAtomic(USERS_PATH, JSON.stringify(data, null, 2))
}
