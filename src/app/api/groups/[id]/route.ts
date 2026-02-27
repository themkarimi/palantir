import { NextResponse } from 'next/server'
import { readUsersData, writeUsersData } from '@/lib/db'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, description } = body

    const data = await readUsersData()
    const idx = data.groups.findIndex((g) => g.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 })
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ success: false, error: 'Group name cannot be empty' }, { status: 400 })
      }
      const conflict = data.groups.some(
        (g) => g.id !== id && g.name.toLowerCase() === name.toLowerCase()
      )
      if (conflict) {
        return NextResponse.json({ success: false, error: 'A group with this name already exists' }, { status: 409 })
      }
      data.groups[idx].name = name.trim()
    }

    if (description !== undefined) {
      data.groups[idx].description = String(description).trim()
    }

    await writeUsersData(data)

    return NextResponse.json({ success: true, data: data.groups[idx] })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const data = await readUsersData()
    const idx = data.groups.findIndex((g) => g.id === id)
    if (idx === -1) {
      return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 })
    }

    const groupName = data.groups[idx].name
    data.groups.splice(idx, 1)

    // Remove this group from all local users
    data.users = data.users.map((u) => ({
      ...u,
      groups: u.groups.filter((g) => g !== groupName),
    }))

    await writeUsersData(data)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
