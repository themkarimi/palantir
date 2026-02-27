import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminPath = pathname.startsWith('/admin')
  const isAdminLogin = pathname === '/admin/login'
  const isCatalogLogin = pathname === '/login'

  // Allow login pages through unconditionally
  if (isAdminLogin || isCatalogLogin) {
    return NextResponse.next()
  }

  const token = request.cookies.get('palantir_token')?.value
  const loginUrl = isAdminPath
    ? new URL('/admin/login', request.url)
    : new URL('/login', request.url)

  if (!token) {
    return NextResponse.redirect(loginUrl)
  }

  const payload = await verifyToken(token)
  if (!payload) {
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('palantir_token')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*'],
}
