import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import AuthShell from '@/components/auth/AuthShell'
import { ENTITY_TYPES, ENTITY_PRICE_CENTS, formatPrice } from '@/content/formations'
import { apiPost, ApiError } from '@/lib/api'
import type { EntityType } from '@/types/app'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function GetStartedPage() {
  const [step, setStep] = useState(1)
  const [entityType, setEntityType] = useState<EntityType>('SARL')
  const [form, setForm] = useState({ fullName: '', email: '', country: '', phone: '', password: '' })
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setError(''); setBusy(true)
    try { await apiPost('/api/auth/signup', form); setDone(true) }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Signup failed') }
    finally { setBusy(false) }
  }

  if (done) {
    return (
      <AuthShell title="Check your inbox" subtitle={`We sent a verification link to ${form.email}.`}>
        <p className="text-sm text-frost/70">Verify your email, then log in to complete your {entityType} application.</p>
        <Link to="/login" className="mt-4 inline-block text-teal-electric">Go to login</Link>
      </AuthShell>
    )
  }

  if (step === 1) {
    return (
      <AuthShell title="Start your company in Chad" subtitle="Choose what you want to register">
        <div className="flex flex-col gap-3">
          {ENTITY_TYPES.map((en) => (
            <button key={en.value} type="button" onClick={() => setEntityType(en.value)}
              className={`rounded-xl border px-5 py-4 text-left ${entityType === en.value ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-frost">{en.label}</span>
                <span className="text-sm text-teal-electric">{formatPrice(ENTITY_PRICE_CENTS[en.value])}</span>
              </div>
              <span className="text-sm text-frost/55">{en.blurb}</span>
            </button>
          ))}
          <Button onClick={() => setStep(2)}>Continue</Button>
          <p className="text-center text-sm text-frost/55">Have an account? <Link to="/login" className="text-teal-electric">Log in</Link></p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create your account" subtitle={`Registering: ${entityType}`}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input className={inputCls} placeholder="Full name" value={form.fullName} onChange={set('fullName')} required />
        <input className={inputCls} type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input className={inputCls} placeholder="Country" value={form.country} onChange={set('country')} required />
        <input className={inputCls} placeholder="Phone" value={form.phone} onChange={set('phone')} />
        <input className={inputCls} type="password" placeholder="Password (min 8)" minLength={8} value={form.password} onChange={set('password')} required />
        {error && <p className="text-sm text-indigo-pulse">{error}</p>}
        <Button type="submit" fullWidth disabled={busy}>{busy ? 'Creating…' : 'Create account'}</Button>
        <button type="button" className="text-sm text-frost/55" onClick={() => setStep(1)}>← Back</button>
      </form>
    </AuthShell>
  )
}
