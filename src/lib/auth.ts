import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

const getSecret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'dev-secret-please-change-in-production-32c'
  )

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload
  } catch {
    return null
  }
}
