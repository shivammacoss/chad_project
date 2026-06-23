import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthShell from '@/components/auth/AuthShell'
import { apiGet } from '@/lib/api'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const [state, setState] = useState<'pending' | 'ok' | 'fail'>('pending')

  useEffect(() => {
    const token = params.get('token')
    if (!token) return setState('fail')
    apiGet(`/api/auth/verify-email?token=${token}`)
      .then(() => setState('ok'))
      .catch(() => setState('fail'))
  }, [params])

  const copy = {
    pending: { t: 'Verifying…', s: 'One moment.' },
    ok: { t: 'Email verified ✅', s: 'You can now log in.' },
    fail: { t: 'Verification failed', s: 'The link is invalid or expired.' },
  }[state]

  return (
    <AuthShell title={copy.t} subtitle={copy.s}>
      {state !== 'pending' && <Link to="/login" className="text-teal-electric">Go to login</Link>}
    </AuthShell>
  )
}
