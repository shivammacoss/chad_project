import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchServices, type ServiceDef } from '@/lib/services'
import { formatPrice } from '@/content/formations'
import { apiPost } from '@/lib/api'
import type { Application } from '@/types/app'

export default function StartServicePage() {
  const navigate = useNavigate()
  const [services, setServices] = useState<ServiceDef[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchServices('TD').then(setServices) }, [])

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
