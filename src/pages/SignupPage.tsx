import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import AuthShell from '@/components/auth/AuthShell'
import { apiPost, ApiError } from '@/lib/api'

const inputCls =
  'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: '', email: '', country: '', password: '' })
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await apiPost('/api/auth/signup', form)
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Signup failed')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <AuthShell title="Check your inbox" subtitle={`We sent a verification link to ${form.email}.`}>
        <p className="text-sm text-frost/70">Click the link to activate your account, then log in.</p>
        <Link to="/login" className="mt-4 inline-block text-teal-electric">Go to login</Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create your account" subtitle="Start a company in Chad from anywhere">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input className={inputCls} placeholder="Full name" value={form.fullName} onChange={set('fullName')} required />
        <input className={inputCls} type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input className={inputCls} placeholder="Country" value={form.country} onChange={set('country')} required />
        <input className={inputCls} type="password" placeholder="Password (min 8 chars)" minLength={8} value={form.password} onChange={set('password')} required />
        {error && <p className="text-sm text-indigo-pulse">{error}</p>}
        <Button type="submit" fullWidth disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</Button>
        <p className="text-center text-sm text-frost/55">
          Have an account? <Link to="/login" className="text-teal-electric">Log in</Link>
        </p>
      </form>
    </AuthShell>
  )
}
