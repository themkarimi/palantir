'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const OIDC_ERROR_MESSAGES: Record<string, string> = {
  state_mismatch: 'Authentication state mismatch. Please try again.',
  invalid_callback: 'Invalid callback from identity provider.',
  authentication_failed: 'Authentication failed. Please try again.',
  access_denied: 'Access was denied by the identity provider.',
}

interface LoginFormProps {
  oidcEnabled: boolean
}

export function LoginForm({ oidcEnabled }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const oidcError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Login failed')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const oidcErrorMessage =
    oidcError ? (OIDC_ERROR_MESSAGES[oidcError] ?? `Authentication error: ${oidcError}`) : null

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl
            bg-accent/10 border border-accent/30 mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <h1 className="font-mono text-xl font-bold text-white/90">
            palantir
          </h1>
          <p className="text-white/30 text-sm font-sans mt-1">
            Sign in to access the catalog
          </p>
        </div>

        {oidcErrorMessage && (
          <p className="text-red-400 text-xs font-mono bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
            {oidcErrorMessage}
          </p>
        )}

        {oidcEnabled && (
          <div className="glass-card p-6 mb-4">
            <a
              href="/api/auth/oidc/login?returnTo=/"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg
                bg-accent/10 border border-accent/30 text-accent font-mono text-sm
                hover:bg-accent/20 hover:border-accent/50 transition-all duration-150"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              Sign in with SSO
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          {oidcEnabled && (
            <p className="text-white/50 text-xs font-mono text-center -mt-1">
              or use local credentials
            </p>
          )}
          <div>
            <label className="block text-xs font-mono text-white/50 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus={!oidcEnabled}
              className="input-base w-full"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-white/50 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-base w-full"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-mono bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-accent/10 border border-accent/30
              text-accent font-mono text-sm hover:bg-accent/20 hover:border-accent/50
              transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs font-mono mt-4">
          Credentials are configured via environment variables
        </p>
      </div>
    </div>
  )
}
