import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import AuthShell from '@/components/auth/AuthShell'
import { fetchServices, type ServiceDef } from '@/lib/services'
import { fetchCountries } from '@/lib/countries'
import { formatPrice } from '@/content/formations'
import { apiPost, ApiError } from '@/lib/api'
import type { Country } from '@/types/app'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function GetStartedPage() {
  const [services, setServices] = useState<ServiceDef[]>([])
  const [service, setService] = useState<ServiceDef | null>(null)
  const [country, setCountry] = useState('TD')
  const [countries, setCountries] = useState<Country[]>([])
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ fullName: '', email: '', country: '', phone: '', password: '' })
  const [done, setDone] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    fetchCountries().then(setCountries)
  }, [])

  useEffect(() => {
    fetchServices(country).then((s) => {
      setServices(s)
      const params = new URLSearchParams(window.location.search)
      const pre = params.get('service')
      setService(s.find((x) => x.key === pre) ?? s[0] ?? null)
    })
  }, [country])

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setError(''); setBusy(true)
    try { await apiPost('/api/auth/signup', form); setDone(true) }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Signup failed') }
    finally { setBusy(false) }
  }

  if (done) return (
    <AuthShell title="Check your inbox" subtitle={`We sent a verification link to ${form.email}.`}>
      <p className="text-sm text-frost/70">Verify your email, then log in to complete your {service?.name} request.</p>
      <Link to="/login" className="mt-4 inline-block text-teal-electric">Go to login</Link>
    </AuthShell>
  )

  if (step === 1) {
    const cats = Array.from(new Set(services.map((s) => s.category)))
    return (
      <AuthShell title="Start your application" subtitle="Choose a service">
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-frost/50 mb-2">Country</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)}
              className={`w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50`}>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
          {cats.map((cat) => (
            <div key={cat}>
              <p className="mb-2 text-xs uppercase tracking-wider text-frost/50">{cat}</p>
              <div className="flex flex-col gap-2">
                {services.filter((s) => s.category === cat).map((s) => (
                  <button key={s.key} type="button" onClick={() => setService(s)}
                    className={`rounded-xl border px-4 py-3 text-left ${service?.key === s.key ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-frost">{s.name}</span>
                      <span className="text-sm text-teal-electric">{formatPrice(s.priceCents)}</span>
                    </div>
                    <span className="text-sm text-frost/55">{s.blurb}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button disabled={!service} onClick={() => setStep(2)}>Continue</Button>
          <p className="text-center text-sm text-frost/55">Have an account? <Link to="/login" className="text-teal-electric">Log in</Link></p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create your account" subtitle={`Service: ${service?.name}`}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input className={inputCls} placeholder="Full name" value={form.fullName} onChange={set('fullName')} required />
        <input className={inputCls} type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input className={inputCls} placeholder="Country" value={form.country} onChange={set('country')} required />
        <input className={inputCls} type="tel" placeholder="Phone" value={form.phone} onChange={set('phone')} />
        <input className={inputCls} type="password" placeholder="Password (min 8)" minLength={8} value={form.password} onChange={set('password')} required />
        {error && <p className="text-sm text-indigo-pulse">{error}</p>}
        <Button type="submit" fullWidth disabled={busy}>{busy ? 'Creating…' : 'Create account'}</Button>
        <button type="button" className="text-sm text-frost/55" onClick={() => setStep(1)}>← Back</button>
      </form>
    </AuthShell>
  )
}
