import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/content/formations'
import { fetchServices, type ServiceDef } from '@/lib/services'
import { apiGet, apiPatch, apiUpload, apiPost, ApiError } from '@/lib/api'
import { useTr } from '@/lib/i18n'
import type { Application, PaymentSettings } from '@/types/app'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function GenericServiceWizardPage() {
  const tr = useTr()
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
    }).catch(() => setError(tr({ fr: 'Chargement impossible', en: 'Could not load', ar: 'تعذّر التحميل' })))
  }, [id, tr])

  useEffect(() => {
    apiGet<PaymentSettings>('/api/settings/payment').then(setPm).catch(() => {})
  }, [])

  useEffect(() => {
    if (!pm[method as keyof PaymentSettings]) {
      setMethod(pm.stripe ? 'stripe' : pm.bank_transfer ? 'bank_transfer' : 'flutterwave')
    }
  }, [pm, method])

  async function saveIntake() {
    if (!order) return
    setBusy(true); setError('')
    try { const u = await apiPatch<Application>(`/api/applications/${order._id}`, { intake, currentStep: 2 }); setOrder(u); setStep(2) }
    catch (err) { setError(err instanceof ApiError ? err.message : tr({ fr: 'Enregistrement impossible', en: 'Could not save', ar: 'تعذّر الحفظ' })) }
    finally { setBusy(false) }
  }
  async function uploadDoc(type: string, file: File) {
    if (!order) return
    const form = new FormData(); form.append('type', type); form.append('ownerName', ''); form.append('file', file)
    try { await apiUpload(`/api/applications/${order._id}/documents`, form) } catch { setError(tr({ fr: 'Échec du téléversement (jpg/png/webp/pdf, <=10 Mo).', en: 'Upload failed (jpg/png/webp/pdf, <=10MB).', ar: 'فشل الرفع (jpg/png/webp/pdf، <=10 ميغابايت).' })) }
  }
  async function pay() {
    if (!order) return
    setBusy(true); setError('')
    try {
      const r = await apiPost<{ method: string; url?: string; invoiceNo?: string; bankDetails?: Record<string, string> }>(`/api/applications/${order._id}/checkout`, { method })
      if (r.method === 'stripe' && r.url) { window.location.href = r.url; return }
      if (r.method === 'bank_transfer') { setBankInfo({ invoiceNo: r.invoiceNo!, bankDetails: r.bankDetails! }); setBusy(false); return }
      setError(tr({ fr: 'Paiement indisponible', en: 'Checkout unavailable', ar: 'الدفع غير متاح' })); setBusy(false)
    } catch (err) { setError(err instanceof ApiError ? err.message : tr({ fr: 'Échec du paiement', en: 'Checkout failed', ar: 'فشل الدفع' })); setBusy(false) }
  }

  if (!order || !service) return <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">{error || tr({ fr: 'Chargement…', en: 'Loading…', ar: 'جارٍ التحميل…' })}</div>

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <p className="text-sm text-frost/55">{service.name} · {tr({ fr: 'Étape', en: 'Step', ar: 'الخطوة' })} {step} {tr({ fr: 'sur', en: 'of', ar: 'من' })} 3</p>
        {error && <p className="mt-2 text-sm text-indigo-pulse">{error}</p>}

        {step === 1 && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">{tr({ fr: 'Détails', en: 'Details', ar: 'التفاصيل' })}</h2>
            {service.intakeFields.map((f) => (
              <label key={f.name} className="flex flex-col gap-1">
                <span className="text-sm text-frost/70">{f.label}</span>
                {f.type === 'select' ? (
                  <select className={inputCls} value={intake[f.name] ?? ''} onChange={(e) => setIntake({ ...intake, [f.name]: e.target.value })}>
                    <option value="">{tr({ fr: 'Sélectionner…', en: 'Select…', ar: 'اختر…' })}</option>
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea className={inputCls} value={intake[f.name] ?? ''} onChange={(e) => setIntake({ ...intake, [f.name]: e.target.value })} />
                ) : (
                  <input className={inputCls} type={f.type === 'number' ? 'number' : 'text'} value={intake[f.name] ?? ''} onChange={(e) => setIntake({ ...intake, [f.name]: e.target.value })} />
                )}
              </label>
            ))}
            <Button disabled={busy} onClick={saveIntake}>{tr({ fr: 'Continuer', en: 'Continue', ar: 'متابعة' })}</Button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">{tr({ fr: 'Téléverser les documents', en: 'Upload documents', ar: 'رفع المستندات' })}</h2>
            {service.requiredDocuments.map((d) => (
              <label key={d} className="flex flex-col gap-1">
                <span className="text-sm text-frost/70">{d.replace(/_/g, ' ')}</span>
                <input type="file" accept="image/*,application/pdf" className="text-sm text-frost/70" onChange={(e) => e.target.files?.[0] && uploadDoc(d, e.target.files[0])} />
              </label>
            ))}
            <Button onClick={() => setStep(3)}>{tr({ fr: 'Continuer vers le paiement', en: 'Continue to payment', ar: 'المتابعة إلى الدفع' })}</Button>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">{tr({ fr: 'Vérifier et payer', en: 'Review & pay', ar: 'المراجعة والدفع' })}</h2>
            <div className="rounded-xl border border-frost/10 bg-steel/20 p-5 text-frost">
              <p>{service.name}</p>
              <p className="mt-3 text-xl font-semibold text-teal-electric">{formatPrice(order.priceCents)}</p>
            </div>
            {bankInfo ? (
              <div className="rounded-xl border border-frost/10 bg-steel/20 p-5 text-sm text-frost">
                <p className="font-medium">{tr({ fr: 'Instructions de virement bancaire — Facture', en: 'Bank transfer instructions — Invoice', ar: 'تعليمات التحويل المصرفي — الفاتورة' })} {bankInfo.invoiceNo}</p>
                {Object.entries(bankInfo.bankDetails).map(([k, v]) => <p key={k} className="text-frost/70">{k}: {v}</p>)}
                <Button className="mt-3" onClick={() => navigate('/dashboard')}>{tr({ fr: 'Aller au tableau de bord', en: 'Go to dashboard', ar: 'الذهاب إلى لوحة التحكم' })}</Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {pm.stripe && (<label className="flex items-center gap-2 text-sm text-frost"><input type="radio" name="pm" checked={method === 'stripe'} onChange={() => setMethod('stripe')} /> {tr({ fr: 'Carte (Stripe)', en: 'Card (Stripe)', ar: 'بطاقة (Stripe)' })}</label>)}
                  {pm.bank_transfer && (<label className="flex items-center gap-2 text-sm text-frost"><input type="radio" name="pm" checked={method === 'bank_transfer'} onChange={() => setMethod('bank_transfer')} /> {tr({ fr: 'Virement bancaire', en: 'Bank transfer', ar: 'تحويل مصرفي' })}</label>)}
                  {pm.flutterwave && (<label className="flex items-center gap-2 text-sm text-frost"><input type="radio" name="pm" checked={method === 'flutterwave'} onChange={() => setMethod('flutterwave')} /> {tr({ fr: 'Flutterwave', en: 'Flutterwave', ar: 'Flutterwave' })}</label>)}
                </div>
                <Button disabled={busy} onClick={pay}>{busy ? tr({ fr: 'Traitement en cours…', en: 'Processing…', ar: 'جارٍ المعالجة…' }) : tr({ fr: 'Payer et soumettre', en: 'Pay & submit', ar: 'الدفع والإرسال' })}</Button>
              </>
            )}
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>{tr({ fr: 'Enregistrer et terminer plus tard', en: 'Save & finish later', ar: 'الحفظ والإنهاء لاحقًا' })}</Button>
          </div>
        )}
      </div>
    </div>
  )
}
