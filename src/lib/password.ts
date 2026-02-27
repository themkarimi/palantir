import crypto from 'crypto'

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, dkLen: 32 }

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .scryptSync(password, salt, SCRYPT_PARAMS.dkLen, {
      N: SCRYPT_PARAMS.N,
      r: SCRYPT_PARAMS.r,
      p: SCRYPT_PARAMS.p,
    })
    .toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  try {
    const computed = crypto
      .scryptSync(password, salt, SCRYPT_PARAMS.dkLen, {
        N: SCRYPT_PARAMS.N,
        r: SCRYPT_PARAMS.r,
        p: SCRYPT_PARAMS.p,
      })
      .toString('hex')
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(computed, 'hex')
    )
  } catch {
    return false
  }
}
