import { useEffect, useState } from 'react'
import { apiGet, apiPatch } from '@/lib/api'
import type { PaymentSettings } from '@/types/app'

const METHODS: { key: keyof PaymentSettings; label: string }[] = [
  { key: 'stripe', label: 'Card (Stripe)' }, { key: 'bank_transfer', label: 'Bank transfer' }, { key: 'flutterwave', label: 'Flutterwave' },
]

export default function PaymentSettingsPanel() {
  const [pm, setPm] = useState<PaymentSettings | null>(null)
  useEffect(() => { apiGet<PaymentSettings>('/api/settings/payment').then(setPm).catch(() => {}) }, [])
  async function toggle(k: keyof PaymentSettings) {
    if (!pm) return
    const next = await apiPatch<PaymentSettings>('/api/admin/settings/payment', { [k]: !pm[k] }).catch(() => null)
    if (next) setPm(next)
  }
  if (!pm) return null
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-frost">Payment methods</h2>
      <p className="text-sm text-frost/55">Enabled methods are shown to customers at checkout.</p>
      <div className="mt-3 grid gap-2">
        {METHODS.map((m) => (
          <label key={m.key} className="flex items-center justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-3 text-sm text-frost">
            <span>{m.label}</span>
            <input type="checkbox" checked={pm[m.key]} onChange={() => toggle(m.key)} />
          </label>
        ))}
      </div>
    </section>
  )
}
