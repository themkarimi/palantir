import { createRemoteJWKSet, jwtVerify } from 'jose'

interface OidcProviderConfig {
  authorization_endpoint: string
  token_endpoint: string
  jwks_uri: string
}

interface TokenResponse {
  id_token: string
  access_token: string
  token_type: string
}

// Module-level cache for the OIDC discovery document (TTL: 1 hour)
let providerConfigCache: { config: OidcProviderConfig; expiresAt: number } | null = null

export function isOidcEnabled(): boolean {
  return !!(
    process.env.OIDC_ISSUER &&
    process.env.OIDC_CLIENT_ID &&
    process.env.OIDC_CLIENT_SECRET &&
    process.env.OIDC_REDIRECT_URI
  )
}

export async function getProviderConfig(): Promise<OidcProviderConfig> {
  const now = Date.now()
  if (providerConfigCache && providerConfigCache.expiresAt > now) {
    return providerConfigCache.config
  }
  const issuer = process.env.OIDC_ISSUER!
  const url = `${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`OIDC discovery failed for ${url}: ${res.status}`)
  }
  const config = (await res.json()) as OidcProviderConfig
  providerConfigCache = { config, expiresAt: now + 3600 * 1000 }
  return config
}

export function buildAuthorizationUrl(authEndpoint: string, state: string): string {
  const url = new URL(authEndpoint)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', process.env.OIDC_CLIENT_ID!)
  url.searchParams.set('redirect_uri', process.env.OIDC_REDIRECT_URI!)
  url.searchParams.set('state', state)
  url.searchParams.set('scope', process.env.OIDC_SCOPES ?? 'openid profile email groups')
  return url.toString()
}

export async function exchangeCodeForTokens(
  tokenEndpoint: string,
  code: string
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: process.env.OIDC_CLIENT_ID!,
    client_secret: process.env.OIDC_CLIENT_SECRET!,
    redirect_uri: process.env.OIDC_REDIRECT_URI!,
  })

  const res = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token exchange failed (${res.status}): ${text}`)
  }

  return res.json() as Promise<TokenResponse>
}

export async function verifyAndDecodeIdToken(
  idToken: string,
  jwksUri: string
): Promise<Record<string, unknown>> {
  const JWKS = createRemoteJWKSet(new URL(jwksUri))
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: process.env.OIDC_ISSUER,
    audience: process.env.OIDC_CLIENT_ID,
  })
  return payload as Record<string, unknown>
}

/**
 * Extract group membership from OIDC claims.
 * Keycloak includes groups as an array of strings in the `groups` claim,
 * e.g. ["/admin-group", "/other-group"].
 */
export function extractGroupsFromClaims(claims: Record<string, unknown>): string[] {
  const groups = claims['groups']
  if (Array.isArray(groups)) {
    return groups.map(String)
  }
  return []
}

/**
 * Check whether the authenticated user belongs to the configured admin group.
 * If OIDC_ADMIN_GROUP is not set, any successfully authenticated OIDC user is granted access.
 * Matching is done after stripping the leading slash so that both `/admins` and `admins` work.
 */
export function isInAdminGroup(groups: string[]): boolean {
  const adminGroup = process.env.OIDC_ADMIN_GROUP
  if (!adminGroup) {
    return true
  }
  const normalize = (g: string) => g.replace(/^\//, '')
  const normalizedTarget = normalize(adminGroup)
  return groups.some((g) => normalize(g) === normalizedTarget)
}
