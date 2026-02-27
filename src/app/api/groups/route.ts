import { NextResponse } from 'next/server'
import { readUsersData, writeUsersData } from '@/lib/db'
import type { Group } from '@/types/user'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const data = await readUsersData()
    return NextResponse.json({ success: true, data: data.groups })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to read groups' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description = '' } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Group name is required' }, { status: 400 })
    }

    const data = await readUsersData()

    if (data.groups.some((g) => g.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'A group with this name already exists' }, { status: 409 })
    }

    const newGroup: Group = {
      id: uuidv4(),
      name: name.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      createdAt: new Date().toISOString(),
    }

    data.groups.push(newGroup)
    await writeUsersData(data)

    return NextResponse.json({ success: true, data: newGroup }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
