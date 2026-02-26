import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminPath = pathname.startsWith('/admin')
  const isLoginPath = pathname === '/admin/login'

  // Only protect admin routes
  if (!isAdminPath || isLoginPath) {
    return NextResponse.next()
  }

  const token = request.cookies.get('palantir_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const payload = await verifyToken(token)
  if (!payload) {
    const response = NextResponse.redirect(new URL('/admin/login', request.url))
    response.cookies.delete('palantir_token')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
