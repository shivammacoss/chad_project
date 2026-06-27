import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import ShareholdersStep from '@/components/application/ShareholdersStep'
import DirectorsStep from '@/components/application/DirectorsStep'
import { ENTITY_TYPES, ENTITY_PRICE_CENTS, VO_PLANS, BUSINESS_ACTIVITIES, CURRENCIES, formatPrice } from '@/content/formations'
import { apiPost, apiPatch, apiUpload, apiGet, ApiError } from '@/lib/api'
import { useTr, type Localized } from '@/lib/i18n'
import type { Application, EntityType, Owner, DocType, VoPlan, PaymentSettings } from '@/types/app'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'
const PERSON_DOCS: { type: DocType; ownerName: string; label: Localized }[] = [
  { type: 'passport', ownerName: 'Passport', label: { fr: 'Passeport', en: 'Passport', ar: 'جواز السفر' } },
  { type: 'photo', ownerName: 'Photo', label: { fr: 'Photo', en: 'Photo', ar: 'صورة' } },
  { type: 'address_proof', ownerName: 'Proof of address', label: { fr: 'Justificatif de domicile', en: 'Proof of address', ar: 'إثبات العنوان' } },
]
const CORP_DOCS: { type: DocType; ownerName: string; label: Localized }[] = [
  { type: 'other', ownerName: 'Certificate of Incorporation', label: { fr: 'Certificat de constitution', en: 'Certificate of Incorporation', ar: 'شهادة التأسيس' } },
  { type: 'other', ownerName: 'Articles / Memorandum', label: { fr: 'Statuts / acte constitutif', en: 'Articles / Memorandum', ar: 'النظام الأساسي / عقد التأسيس' } },
  { type: 'other', ownerName: 'Board Resolution', label: { fr: 'Résolution du conseil', en: 'Board Resolution', ar: 'قرار مجلس الإدارة' } },
]

export default function ApplicationWizardPage() {
  const tr = useTr()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [app, setApp] = useState<Application | null>(null)
  const [entityType, setEntityType] = useState<EntityType>('SARL')
  const [company, setCompany] = useState({ proposedName: '', alternateName: '', alternateName2: '', businessActivity: 'Trading', shareCapitalFCFA: 1000000, paidUpCapitalFCFA: 500000, currency: 'FCFA' })
  const [vo, setVo] = useState<{ wanted: boolean; plan?: VoPlan }>({ wanted: false })
  const [shareholders, setShareholders] = useState<Owner[]>([])
  const [directors, setDirectors] = useState<Owner[]>([])
  const [pm, setPm] = useState<PaymentSettings>({ stripe: true, bank_transfer: true, flutterwave: false })
  const [method, setMethod] = useState<'stripe' | 'bank_transfer' | 'flutterwave'>('stripe')
  const [bankInfo, setBankInfo] = useState<{ invoiceNo: string; bankDetails: Record<string, string> } | null>(null)
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)

  useEffect(() => {
    apiGet<PaymentSettings>('/api/settings/payment').then(setPm).catch(() => {})
  }, [])

  useEffect(() => {
    if (!pm[method as keyof PaymentSettings]) {
      setMethod(pm.stripe ? 'stripe' : pm.bank_transfer ? 'bank_transfer' : 'flutterwave')
    }
  }, [pm, method])

  async function save(patch: Record<string, unknown>, next: number) {
    if (!app) return
    setBusy(true); setError('')
    try { const u = await apiPatch<Application>(`/api/applications/${app._id}`, { ...patch, currentStep: next }); setApp(u); setStep(next) }
    catch (err) { setError(err instanceof ApiError ? err.message : tr({ fr: 'Enregistrement impossible', en: 'Could not save', ar: 'تعذّر الحفظ' })) }
    finally { setBusy(false) }
  }
  async function createApp() {
    setBusy(true); setError('')
    try { const c = await apiPost<Application>('/api/applications', { entityType, packageTier: 'standard' }); setApp(c); setStep(2) }
    catch (err) { setError(err instanceof ApiError ? err.message : tr({ fr: 'Démarrage impossible', en: 'Could not start', ar: 'تعذّر البدء' })) }
    finally { setBusy(false) }
  }
  async function uploadDoc(type: DocType, ownerName: string, file: File) {
    if (!app) return
    const form = new FormData(); form.append('type', type); form.append('ownerName', ownerName); form.append('file', file)
    try { await apiUpload(`/api/applications/${app._id}/documents`, form) } catch { setError(tr({ fr: 'Échec du téléversement (jpg/png/webp/pdf, <=10 Mo).', en: 'Upload failed (jpg/png/webp/pdf, <=10MB).', ar: 'فشل الرفع (jpg/png/webp/pdf، <=10 ميغابايت).' })) }
  }
  async function payAndSubmit() {
    if (!app) return
    setBusy(true); setError('')
    try {
      const r = await apiPost<{ method: string; url?: string; invoiceNo?: string; bankDetails?: Record<string, string> }>(`/api/applications/${app._id}/checkout`, { method })
      if (r.method === 'stripe' && r.url) { window.location.href = r.url; return }
      if (r.method === 'bank_transfer') { setBankInfo({ invoiceNo: r.invoiceNo!, bankDetails: r.bankDetails! }); setBusy(false); return }
      setError(tr({ fr: 'Paiement indisponible', en: 'Checkout unavailable', ar: 'الدفع غير متاح' })); setBusy(false)
    } catch (err) { setError(err instanceof ApiError ? err.message : tr({ fr: 'Échec du paiement', en: 'Checkout failed', ar: 'فشل الدفع' })); setBusy(false) }
  }

  const allPeople = [...shareholders, ...directors]
  const hasCorporate = shareholders.some((s) => s.isCorporate)

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <p className="text-sm text-frost/55">{tr({ fr: 'Étape', en: 'Step', ar: 'الخطوة' })} {step} {tr({ fr: 'sur', en: 'of', ar: 'من' })} 6</p>
        {error && <p className="mt-2 text-sm text-indigo-pulse">{error}</p>}

        {step === 1 && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">{tr({ fr: 'Choisissez votre entité', en: 'Choose your entity', ar: 'اختر الكيان الخاص بك' })}</h2>
            {ENTITY_TYPES.map((en) => (
              <button key={en.value} type="button" onClick={() => setEntityType(en.value)}
                className={`rounded-xl border px-5 py-4 text-left ${entityType === en.value ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
                <div className="flex justify-between"><span className="font-medium text-frost">{tr(en.label)}</span><span className="text-sm text-teal-electric">{formatPrice(ENTITY_PRICE_CENTS[en.value])}</span></div>
                <span className="text-sm text-frost/55">{tr(en.blurb)}</span>
              </button>
            ))}
            <Button disabled={busy} onClick={createApp}>{tr({ fr: 'Continuer', en: 'Continue', ar: 'متابعة' })}</Button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-frost">{tr({ fr: 'Détails de la société', en: 'Company details', ar: 'تفاصيل الشركة' })}</h2>
            <input className={inputCls} placeholder={tr({ fr: 'Nom souhaité 1', en: 'Preferred name 1', ar: 'الاسم المفضّل 1' })} value={company.proposedName} onChange={(e) => setCompany({ ...company, proposedName: e.target.value })} />
            <input className={inputCls} placeholder={tr({ fr: 'Nom souhaité 2', en: 'Preferred name 2', ar: 'الاسم المفضّل 2' })} value={company.alternateName} onChange={(e) => setCompany({ ...company, alternateName: e.target.value })} />
            <input className={inputCls} placeholder={tr({ fr: 'Nom souhaité 3', en: 'Preferred name 3', ar: 'الاسم المفضّل 3' })} value={company.alternateName2} onChange={(e) => setCompany({ ...company, alternateName2: e.target.value })} />
            <select className={inputCls} value={company.businessActivity} onChange={(e) => setCompany({ ...company, businessActivity: e.target.value })}>
              {BUSINESS_ACTIVITIES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} type="number" placeholder={tr({ fr: 'Capital social', en: 'Share capital', ar: 'رأس المال' })} value={company.shareCapitalFCFA} onChange={(e) => setCompany({ ...company, shareCapitalFCFA: Number(e.target.value) })} />
              <input className={inputCls} type="number" placeholder={tr({ fr: 'Capital libéré', en: 'Paid-up capital', ar: 'رأس المال المدفوع' })} value={company.paidUpCapitalFCFA} onChange={(e) => setCompany({ ...company, paidUpCapitalFCFA: Number(e.target.value) })} />
            </div>
            <select className={inputCls} value={company.currency} onChange={(e) => setCompany({ ...company, currency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <p className="mt-2 text-sm uppercase tracking-wider text-frost/50">{tr({ fr: 'Siège social', en: 'Registered office', ar: 'المقر المسجَّل' })}</p>
            <button type="button" onClick={() => setVo({ wanted: false })} className={`rounded-xl border px-4 py-3 text-left ${!vo.wanted ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
              <span className="font-medium text-frost">{tr({ fr: 'J\'ai ma propre adresse', en: 'I have my own address', ar: 'لديّ عنواني الخاص' })}</span>
            </button>
            {VO_PLANS.map((p) => (
              <button key={p.value} type="button" onClick={() => setVo({ wanted: true, plan: p.value })}
                className={`rounded-xl border px-4 py-3 text-left ${vo.wanted && vo.plan === p.value ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
                <div className="flex justify-between"><span className="font-medium text-frost">{tr(p.label)}</span><span className="text-sm text-teal-electric">{formatPrice(p.priceCents)}</span></div>
              </button>
            ))}
            <Button disabled={busy || !company.proposedName} onClick={() => save({ companyDetails: { ...company, city: "N'Djamena" }, virtualOffice: vo }, 3)}>{tr({ fr: 'Continuer', en: 'Continue', ar: 'متابعة' })}</Button>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 flex flex-col gap-4">
            <ShareholdersStep value={shareholders} onChange={setShareholders} />
            <Button disabled={busy || shareholders.length === 0} onClick={() => save({ owners: [...shareholders, ...directors] }, 4)}>{tr({ fr: 'Continuer', en: 'Continue', ar: 'متابعة' })}</Button>
          </div>
        )}

        {step === 4 && (
          <div className="mt-4 flex flex-col gap-4">
            <DirectorsStep value={directors} onChange={setDirectors} />
            <Button disabled={busy || directors.length === 0} onClick={() => save({ owners: [...shareholders, ...directors] }, 5)}>{tr({ fr: 'Continuer', en: 'Continue', ar: 'متابعة' })}</Button>
          </div>
        )}

        {step === 5 && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">{tr({ fr: 'Téléverser les documents', en: 'Upload documents', ar: 'رفع المستندات' })}</h2>
            {allPeople.map((p, idx) => (
              <div key={idx} className="rounded-xl border border-frost/10 bg-steel/20 p-4">
                <p className="text-sm font-medium text-frost">{p.fullName || tr({ fr: 'Personne', en: 'Person', ar: 'شخص' })} <span className="text-frost/50">({p.role})</span></p>
                {PERSON_DOCS.map((d) => (
                  <label key={d.ownerName} className="mt-2 flex flex-col gap-1">
                    <span className="text-sm text-frost/70">{tr(d.label)}</span>
                    <input type="file" accept="image/*,application/pdf" className="text-sm text-frost/70" onChange={(e) => e.target.files?.[0] && uploadDoc(d.type, p.fullName, e.target.files[0])} />
                  </label>
                ))}
              </div>
            ))}
            {hasCorporate && (
              <div className="rounded-xl border border-frost/10 bg-steel/20 p-4">
                <p className="text-sm font-medium text-frost">{tr({ fr: 'Documents de l\'actionnaire personne morale', en: 'Corporate shareholder documents', ar: 'مستندات المساهم الاعتباري' })}</p>
                {CORP_DOCS.map((d) => (
                  <label key={d.ownerName} className="mt-2 flex flex-col gap-1">
                    <span className="text-sm text-frost/70">{tr(d.label)}</span>
                    <input type="file" accept="image/*,application/pdf" className="text-sm text-frost/70" onChange={(e) => e.target.files?.[0] && uploadDoc(d.type, d.ownerName, e.target.files[0])} />
                  </label>
                ))}
              </div>
            )}
            <Button onClick={() => setStep(6)}>{tr({ fr: 'Continuer vers le paiement', en: 'Continue to payment', ar: 'المتابعة إلى الدفع' })}</Button>
          </div>
        )}

        {step === 6 && app && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">{tr({ fr: 'Vérifier et payer', en: 'Review & pay', ar: 'المراجعة والدفع' })}</h2>
            <div className="rounded-xl border border-frost/10 bg-steel/20 p-5 text-frost">
              <p>{app.companyDetails?.proposedName}</p>
              <p className="text-sm text-frost/55">{(() => { const et = ENTITY_TYPES.find((e) => e.value === app.entityType)?.label; return et ? tr(et) : '' })()} · {shareholders.length} {tr({ fr: 'actionnaire(s)', en: 'shareholder(s)', ar: 'مساهم/مساهمون' })} · {directors.length} {tr({ fr: 'administrateur(s)', en: 'director(s)', ar: 'مدير/مديرون' })} · {app.virtualOffice?.wanted ? `${tr({ fr: 'Bureau virtuel', en: 'VO', ar: 'مكتب افتراضي' })}: ${app.virtualOffice.plan}` : tr({ fr: 'pas de bureau virtuel', en: 'no VO', ar: 'بدون مكتب افتراضي' })}</p>
              <p className="mt-3 text-xl font-semibold text-teal-electric">{formatPrice(app.priceCents)}</p>
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
                <Button disabled={busy} onClick={payAndSubmit}>{busy ? tr({ fr: 'Traitement en cours…', en: 'Processing…', ar: 'جارٍ المعالجة…' }) : tr({ fr: 'Payer et soumettre', en: 'Pay & submit', ar: 'الدفع والإرسال' })}</Button>
              </>
            )}
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>{tr({ fr: 'Enregistrer et terminer plus tard', en: 'Save & finish later', ar: 'الحفظ والإنهاء لاحقًا' })}</Button>
          </div>
        )}
      </div>
    </div>
  )
}
