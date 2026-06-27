import { useEffect, useState } from 'react'
import { apiGet, apiPatch } from '@/lib/api'
import { useTr, type Localized } from '@/lib/i18n'
import type { PaymentSettings } from '@/types/app'

const METHODS: { key: keyof PaymentSettings; label: Localized }[] = [
  { key: 'stripe', label: { fr: 'Carte (Stripe)', en: 'Card (Stripe)', ar: 'بطاقة (Stripe)' } },
  { key: 'bank_transfer', label: { fr: 'Virement bancaire', en: 'Bank transfer', ar: 'تحويل بنكي' } },
  { key: 'flutterwave', label: { fr: 'Flutterwave', en: 'Flutterwave', ar: 'Flutterwave' } },
]

export default function PaymentSettingsPanel() {
  const tr = useTr()
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
      <h2 className="text-lg font-semibold text-frost">{tr({ fr: 'Moyens de paiement', en: 'Payment methods', ar: 'طرق الدفع' })}</h2>
      <p className="text-sm text-frost/55">{tr({ fr: 'Les moyens activés sont proposés aux clients au moment du paiement.', en: 'Enabled methods are shown to customers at checkout.', ar: 'تظهر الطرق المفعّلة للعملاء عند الدفع.' })}</p>
      <div className="mt-3 grid gap-2">
        {METHODS.map((m) => (
          <label key={m.key} className="flex items-center justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-3 text-sm text-frost">
            <span>{tr(m.label)}</span>
            <input type="checkbox" checked={pm[m.key]} onChange={() => toggle(m.key)} />
          </label>
        ))}
      </div>
    </section>
  )
}
