import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { signToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const validEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'
    const validPassword = process.env.ADMIN_PASSWORD ?? 'changeme'

    if (email !== validEmail || password !== validPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = await signToken({ email, role: 'admin' })

    const cookieStore = await cookies()
    cookieStore.set('palantir_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('palantir_token')
  return NextResponse.json({ success: true })
}
