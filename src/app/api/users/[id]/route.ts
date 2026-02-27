import { NextResponse } from 'next/server'
import { readUsersData, writeUsersData } from '@/lib/db'
import { hashPassword } from '@/lib/password'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { email, password, groups } = body

    const data = await readUsersData()
    const idx = data.users.findIndex((u) => u.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    if (email !== undefined) {
      if (!email.trim()) {
        return NextResponse.json({ success: false, error: 'Email cannot be empty' }, { status: 400 })
      }
      const conflict = data.users.some(
        (u) => u.id !== id && u.email.toLowerCase() === email.toLowerCase()
      )
      if (conflict) {
        return NextResponse.json({ success: false, error: 'A user with this email already exists' }, { status: 409 })
      }
      data.users[idx].email = email.trim().toLowerCase()
    }

    if (password !== undefined) {
      if (password.length < 8) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 8 characters' },
          { status: 400 }
        )
      }
      data.users[idx].passwordHash = hashPassword(password)
    }

    if (groups !== undefined) {
      data.users[idx].groups = Array.isArray(groups) ? groups.map(String) : []
    }

    await writeUsersData(data)

    const { passwordHash: _, ...safeUser } = data.users[idx]
    return NextResponse.json({ success: true, data: safeUser })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const data = await readUsersData()
    const idx = data.users.findIndex((u) => u.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    data.users.splice(idx, 1)
    await writeUsersData(data)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
