import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchServices, type ServiceDef } from '@/lib/services'
import { fetchCountries } from '@/lib/countries'
import { formatPrice } from '@/content/formations'
import { apiPost } from '@/lib/api'
import type { Application, Country } from '@/types/app'

export default function StartServicePage() {
  const navigate = useNavigate()
  const [services, setServices] = useState<ServiceDef[]>([])
  const [country, setCountry] = useState('TD')
  const [countries, setCountries] = useState<Country[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchCountries().then(setCountries) }, [])
  useEffect(() => { fetchServices(country).then(setServices) }, [country])

  async function choose(s: ServiceDef) {
    if (s.flow === 'formation') { navigate('/applications/new'); return }
    setBusy(true); setError('')
    try {
      const order = await apiPost<Application>('/api/applications', { serviceKey: s.key })
      navigate(`/services/${order._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start application')
    } finally { setBusy(false) }
  }

  const cats = Array.from(new Set(services.map((s) => s.category)))
  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-2xl font-semibold text-frost">Start a new application</h1>
        <div className="mt-4">
          <label className="block text-xs uppercase tracking-wider text-frost/50 mb-2">Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)}
            className={`w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50`}>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
            ))}
          </select>
        </div>
        {error && <p className="mt-2 text-sm text-indigo-pulse">{error}</p>}
        {cats.map((cat) => (
          <div key={cat} className="mt-6">
            <p className="mb-2 text-xs uppercase tracking-wider text-frost/50">{cat}</p>
            <div className="grid gap-2">
              {services.filter((s) => s.category === cat).map((s) => (
                <button key={s.key} type="button" disabled={busy} onClick={() => choose(s)}
                  className="flex items-center justify-between rounded-xl border border-frost/10 bg-steel/20 px-5 py-4 text-left hover:border-teal-electric/30">
                  <span><span className="font-medium text-frost">{s.name}</span><span className="block text-sm text-frost/55">{s.blurb}</span></span>
                  <span className="text-sm text-teal-electric">{formatPrice(s.priceCents)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
