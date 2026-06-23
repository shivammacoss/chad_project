import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import AuthShell from '@/components/auth/AuthShell'
import { useAuth } from '@/store/AuthContext'
import { ApiError } from '@/lib/api'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function AdminLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setError(''); setBusy(true)
    try {
      const u = await login(email, password)
      if (u.role === 'admin') navigate('/admin')
      else setError('This account is not an admin.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally { setBusy(false) }
  }

  return (
    <AuthShell title="Admin sign in" subtitle="Staff access only">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={inputCls} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-indigo-pulse">{error}</p>}
        <Button type="submit" fullWidth disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
      </form>
    </AuthShell>
  )
}
