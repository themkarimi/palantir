'use client'

import { LoginForm as SharedLoginForm } from '@/components/auth/LoginForm'

export function LoginForm({ oidcEnabled }: { oidcEnabled: boolean }) {
  return <SharedLoginForm oidcEnabled={oidcEnabled} isAdmin />
}
