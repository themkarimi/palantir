import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { isOidcEnabled, getProviderConfig, buildAuthorizationUrl } from '@/lib/oidc'

export async function GET(request: Request) {
  if (!isOidcEnabled()) {
    return NextResponse.json({ error: 'OIDC is not configured' }, { status: 404 })
  }

  const url = new URL(request.url)
  const returnTo = url.searchParams.get('returnTo') ?? '/admin'

  const providerConfig = await getProviderConfig()

  const state = randomBytes(16).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set('oidc_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  })
  cookieStore.set('oidc_return_to', returnTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  })

  const authUrl = buildAuthorizationUrl(providerConfig.authorization_endpoint, state)
  return NextResponse.redirect(authUrl)
}
