import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  isOidcEnabled,
  getProviderConfig,
  exchangeCodeForTokens,
  verifyAndDecodeIdToken,
  extractGroupsFromClaims,
  isInAdminGroup,
} from '@/lib/oidc'
import { signToken } from '@/lib/auth'

const SESSION_DURATION_SECONDS = 8 * 60 * 60

export async function GET(request: Request) {
  if (!isOidcEnabled()) {
    return NextResponse.json({ error: 'OIDC is not configured' }, { status: 404 })
  }

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  const cookieStore = await cookies()
  const returnTo = cookieStore.get('oidc_return_to')?.value ?? '/admin'
  cookieStore.delete('oidc_return_to')

  const isAdminFlow = returnTo.startsWith('/admin')
  const loginBase = new URL(isAdminFlow ? '/admin/login' : '/login', request.url)

  if (error) {
    loginBase.searchParams.set('error', error)
    return NextResponse.redirect(loginBase)
  }

  if (!code || !state) {
    loginBase.searchParams.set('error', 'invalid_callback')
    return NextResponse.redirect(loginBase)
  }

  const storedState = cookieStore.get('oidc_state')?.value
  cookieStore.delete('oidc_state')

  if (!storedState || storedState !== state) {
    loginBase.searchParams.set('error', 'state_mismatch')
    return NextResponse.redirect(loginBase)
  }

  try {
    const providerConfig = await getProviderConfig()
    const tokens = await exchangeCodeForTokens(providerConfig.token_endpoint, code)
    const claims = await verifyAndDecodeIdToken(tokens.id_token, providerConfig.jwks_uri)

    const groups = extractGroupsFromClaims(claims)

    // Only enforce admin-group membership when accessing the admin area
    if (isAdminFlow && !isInAdminGroup(groups)) {
      loginBase.searchParams.set('error', 'insufficient_permissions')
      return NextResponse.redirect(loginBase)
    }

    // Prefer email for display; fall back to preferred_username or sub (UUID-like identifier)
    // The value is stored in the JWT for informational purposes only, not for credential checks
    const email = String(
      claims['email'] ?? claims['preferred_username'] ?? claims['sub']
    )
    const role = isInAdminGroup(groups) ? 'admin' : 'user'
    const sessionToken = await signToken({ email, role, sub: String(claims['sub']), groups })

    cookieStore.set('palantir_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_DURATION_SECONDS,
    })

    return NextResponse.redirect(new URL(returnTo, request.url))
  } catch (err) {
    console.error('OIDC callback error:', err)
    loginBase.searchParams.set('error', 'authentication_failed')
    return NextResponse.redirect(loginBase)
  }
}
