import { NextResponse } from 'next/server'
import { readUsersData, writeUsersData } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import type { LocalUser } from '@/types/user'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const data = await readUsersData()
    // Never expose password hashes to the client
    const safeUsers = data.users.map(({ passwordHash: _, ...rest }) => rest)
    return NextResponse.json({ success: true, data: safeUsers })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to read users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, groups = [] } = body

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const data = await readUsersData()

    if (data.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'A user with this email already exists' }, { status: 409 })
    }

    const newUser: LocalUser = {
      id: uuidv4(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      groups: Array.isArray(groups) ? groups.map(String) : [],
      createdAt: new Date().toISOString(),
    }

    data.users.push(newUser)
    await writeUsersData(data)

    const { passwordHash: _, ...safeUser } = newUser
    return NextResponse.json({ success: true, data: safeUser }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
