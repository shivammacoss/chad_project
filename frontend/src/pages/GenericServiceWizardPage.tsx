import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/content/formations'
import { fetchServices, type ServiceDef } from '@/lib/services'
import { apiGet, apiPatch, apiUpload, apiPost, ApiError } from '@/lib/api'
import type { Application, PaymentSettings } from '@/types/app'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function GenericServiceWizardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Application | null>(null)
  const [service, setService] = useState<ServiceDef | null>(null)
  const [intake, setIntake] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)
  const [pm, setPm] = useState<PaymentSettings>({ stripe: true, bank_transfer: true, flutterwave: false })
  const [method, setMethod] = useState<'stripe' | 'bank_transfer' | 'flutterwave'>('stripe')
  const [bankInfo, setBankInfo] = useState<{ invoiceNo: string; bankDetails: Record<string, string> } | null>(null)
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    apiGet<Application>(`/api/applications/${id}`).then(async (o) => {
      setOrder(o)
      setIntake((o.intake as Record<string, string>) ?? {})
      const svcs = await fetchServices('all')
      setService(svcs.find((s) => s.key === o.serviceKey) ?? null)
    }).catch(() => setError('Could not load'))
  }, [id])

  useEffect(() => {
    apiGet<PaymentSettings>('/api/settings/payment').then(setPm).catch(() => {})
  }, [])

  useEffect(() => {
    if (!pm[method as keyof PaymentSettings]) {
      setMethod(pm.stripe ? 'stripe' : pm.bank_transfer ? 'bank_transfer' : 'flutterwave')
    }
  }, [pm])

  async function saveIntake() {
    if (!order) return
    setBusy(true); setError('')
    try { const u = await apiPatch<Application>(`/api/applications/${order._id}`, { intake, currentStep: 2 }); setOrder(u); setStep(2) }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Could not save') }
    finally { setBusy(false) }
  }
  async function uploadDoc(type: string, file: File) {
    if (!order) return
    const form = new FormData(); form.append('type', type); form.append('ownerName', ''); form.append('file', file)
    try { await apiUpload(`/api/applications/${order._id}/documents`, form) } catch { setError('Upload failed (jpg/png/webp/pdf, <=10MB).') }
  }
  async function pay() {
    if (!order) return
    setBusy(true); setError('')
    try {
      const r = await apiPost<{ method: string; url?: string; invoiceNo?: string; bankDetails?: Record<string, string> }>(`/api/applications/${order._id}/checkout`, { method })
      if (r.method === 'stripe' && r.url) { window.location.href = r.url; return }
      if (r.method === 'bank_transfer') { setBankInfo({ invoiceNo: r.invoiceNo!, bankDetails: r.bankDetails! }); setBusy(false); return }
      setError('Checkout unavailable'); setBusy(false)
    } catch (err) { setError(err instanceof ApiError ? err.message : 'Checkout failed'); setBusy(false) }
  }

  if (!order || !service) return <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">{error || 'Loading…'}</div>

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <p className="text-sm text-frost/55">{service.name} · Step {step} of 3</p>
        {error && <p className="mt-2 text-sm text-indigo-pulse">{error}</p>}

        {step === 1 && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">Details</h2>
            {service.intakeFields.map((f) => (
              <label key={f.name} className="flex flex-col gap-1">
                <span className="text-sm text-frost/70">{f.label}</span>
                {f.type === 'select' ? (
                  <select className={inputCls} value={intake[f.name] ?? ''} onChange={(e) => setIntake({ ...intake, [f.name]: e.target.value })}>
                    <option value="">Select…</option>
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea className={inputCls} value={intake[f.name] ?? ''} onChange={(e) => setIntake({ ...intake, [f.name]: e.target.value })} />
                ) : (
                  <input className={inputCls} type={f.type === 'number' ? 'number' : 'text'} value={intake[f.name] ?? ''} onChange={(e) => setIntake({ ...intake, [f.name]: e.target.value })} />
                )}
              </label>
            ))}
            <Button disabled={busy} onClick={saveIntake}>Continue</Button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">Upload documents</h2>
            {service.requiredDocuments.map((d) => (
              <label key={d} className="flex flex-col gap-1">
                <span className="text-sm text-frost/70">{d.replace(/_/g, ' ')}</span>
                <input type="file" accept="image/*,application/pdf" className="text-sm text-frost/70" onChange={(e) => e.target.files?.[0] && uploadDoc(d, e.target.files[0])} />
              </label>
            ))}
            <Button onClick={() => setStep(3)}>Continue to payment</Button>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">Review & pay</h2>
            <div className="rounded-xl border border-frost/10 bg-steel/20 p-5 text-frost">
              <p>{service.name}</p>
              <p className="mt-3 text-xl font-semibold text-teal-electric">{formatPrice(order.priceCents)}</p>
            </div>
            {bankInfo ? (
              <div className="rounded-xl border border-frost/10 bg-steel/20 p-5 text-sm text-frost">
                <p className="font-medium">Bank transfer instructions — Invoice {bankInfo.invoiceNo}</p>
                {Object.entries(bankInfo.bankDetails).map(([k, v]) => <p key={k} className="text-frost/70">{k}: {v}</p>)}
                <Button className="mt-3" onClick={() => navigate('/dashboard')}>Go to dashboard</Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {pm.stripe && (<label className="flex items-center gap-2 text-sm text-frost"><input type="radio" name="pm" checked={method === 'stripe'} onChange={() => setMethod('stripe')} /> Card (Stripe)</label>)}
                  {pm.bank_transfer && (<label className="flex items-center gap-2 text-sm text-frost"><input type="radio" name="pm" checked={method === 'bank_transfer'} onChange={() => setMethod('bank_transfer')} /> Bank transfer</label>)}
                  {pm.flutterwave && (<label className="flex items-center gap-2 text-sm text-frost"><input type="radio" name="pm" checked={method === 'flutterwave'} onChange={() => setMethod('flutterwave')} /> Flutterwave</label>)}
                </div>
                <Button disabled={busy} onClick={pay}>{busy ? 'Processing…' : 'Pay & submit'}</Button>
              </>
            )}
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Save & finish later</Button>
          </div>
        )}
      </div>
    </div>
  )
}
