import { Suspense } from 'react'
import { isOidcEnabled } from '@/lib/oidc'
import { LoginForm } from './LoginForm'

export default function LoginPage() {
  const oidcEnabled = isOidcEnabled()
  return (
    <Suspense>
      <LoginForm oidcEnabled={oidcEnabled} />
    </Suspense>
  )
}
