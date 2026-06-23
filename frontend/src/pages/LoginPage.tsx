import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import AuthShell from '@/components/auth/AuthShell'
import { useAuth } from '@/store/AuthContext'
import { ApiError } from '@/lib/api'

const inputCls =
  'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const u = await login(email, password)
      navigate(u.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage your formations">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={inputCls} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-indigo-pulse">{error}</p>}
        <Button type="submit" fullWidth disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</Button>
        <p className="text-center text-sm text-frost/55">
          No account? <Link to="/signup" className="text-teal-electric">Sign up</Link>
        </p>
      </form>
    </AuthShell>
  )
}
