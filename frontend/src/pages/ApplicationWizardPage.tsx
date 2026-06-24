import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import ShareholdersStep from '@/components/application/ShareholdersStep'
import DirectorsStep from '@/components/application/DirectorsStep'
import { ENTITY_TYPES, ENTITY_PRICE_CENTS, VO_PLANS, BUSINESS_ACTIVITIES, CURRENCIES, formatPrice } from '@/content/formations'
import { apiPost, apiPatch, apiUpload, ApiError } from '@/lib/api'
import type { Application, EntityType, Owner, DocType, VoPlan } from '@/types/app'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'
const PERSON_DOCS: { type: DocType; label: string }[] = [
  { type: 'passport', label: 'Passport' }, { type: 'photo', label: 'Photo' }, { type: 'address_proof', label: 'Proof of address' },
]
const CORP_DOCS: { type: DocType; label: string }[] = [
  { type: 'other', label: 'Certificate of Incorporation' }, { type: 'other', label: 'Articles / Memorandum' }, { type: 'other', label: 'Board Resolution' },
]

export default function ApplicationWizardPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [app, setApp] = useState<Application | null>(null)
  const [entityType, setEntityType] = useState<EntityType>('SARL')
  const [company, setCompany] = useState({ proposedName: '', alternateName: '', alternateName2: '', businessActivity: 'Trading', shareCapitalFCFA: 1000000, paidUpCapitalFCFA: 500000, currency: 'FCFA' })
  const [vo, setVo] = useState<{ wanted: boolean; plan?: VoPlan }>({ wanted: false })
  const [shareholders, setShareholders] = useState<Owner[]>([])
  const [directors, setDirectors] = useState<Owner[]>([])
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)

  async function save(patch: Record<string, unknown>, next: number) {
    if (!app) return
    setBusy(true); setError('')
    try { const u = await apiPatch<Application>(`/api/applications/${app._id}`, { ...patch, currentStep: next }); setApp(u); setStep(next) }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Could not save') }
    finally { setBusy(false) }
  }
  async function createApp() {
    setBusy(true); setError('')
    try { const c = await apiPost<Application>('/api/applications', { entityType, packageTier: 'standard' }); setApp(c); setStep(2) }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Could not start') }
    finally { setBusy(false) }
  }
  async function uploadDoc(type: DocType, ownerName: string, file: File) {
    if (!app) return
    const form = new FormData(); form.append('type', type); form.append('ownerName', ownerName); form.append('file', file)
    try { await apiUpload(`/api/applications/${app._id}/documents`, form) } catch { setError('Upload failed (jpg/png/webp/pdf, <=10MB).') }
  }
  async function payAndSubmit() {
    if (!app) return
    setBusy(true); setError('')
    try { const { url } = await apiPost<{ url: string }>(`/api/applications/${app._id}/checkout`); if (!url) { setError('Checkout unavailable'); setBusy(false); return } window.location.href = url }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Checkout failed'); setBusy(false) }
  }

  const allPeople = [...shareholders, ...directors]
  const hasCorporate = shareholders.some((s) => s.isCorporate)

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <p className="text-sm text-frost/55">Step {step} of 6</p>
        {error && <p className="mt-2 text-sm text-indigo-pulse">{error}</p>}

        {step === 1 && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">Choose your entity</h2>
            {ENTITY_TYPES.map((en) => (
              <button key={en.value} type="button" onClick={() => setEntityType(en.value)}
                className={`rounded-xl border px-5 py-4 text-left ${entityType === en.value ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
                <div className="flex justify-between"><span className="font-medium text-frost">{en.label}</span><span className="text-sm text-teal-electric">{formatPrice(ENTITY_PRICE_CENTS[en.value])}</span></div>
                <span className="text-sm text-frost/55">{en.blurb}</span>
              </button>
            ))}
            <Button disabled={busy} onClick={createApp}>Continue</Button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 flex flex-col gap-3">
            <h2 className="text-xl font-semibold text-frost">Company details</h2>
            <input className={inputCls} placeholder="Preferred name 1" value={company.proposedName} onChange={(e) => setCompany({ ...company, proposedName: e.target.value })} />
            <input className={inputCls} placeholder="Preferred name 2" value={company.alternateName} onChange={(e) => setCompany({ ...company, alternateName: e.target.value })} />
            <input className={inputCls} placeholder="Preferred name 3" value={company.alternateName2} onChange={(e) => setCompany({ ...company, alternateName2: e.target.value })} />
            <select className={inputCls} value={company.businessActivity} onChange={(e) => setCompany({ ...company, businessActivity: e.target.value })}>
              {BUSINESS_ACTIVITIES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} type="number" placeholder="Share capital" value={company.shareCapitalFCFA} onChange={(e) => setCompany({ ...company, shareCapitalFCFA: Number(e.target.value) })} />
              <input className={inputCls} type="number" placeholder="Paid-up capital" value={company.paidUpCapitalFCFA} onChange={(e) => setCompany({ ...company, paidUpCapitalFCFA: Number(e.target.value) })} />
            </div>
            <select className={inputCls} value={company.currency} onChange={(e) => setCompany({ ...company, currency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <p className="mt-2 text-sm uppercase tracking-wider text-frost/50">Registered office</p>
            <button type="button" onClick={() => setVo({ wanted: false })} className={`rounded-xl border px-4 py-3 text-left ${!vo.wanted ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
              <span className="font-medium text-frost">I have my own address</span>
            </button>
            {VO_PLANS.map((p) => (
              <button key={p.value} type="button" onClick={() => setVo({ wanted: true, plan: p.value })}
                className={`rounded-xl border px-4 py-3 text-left ${vo.wanted && vo.plan === p.value ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
                <div className="flex justify-between"><span className="font-medium text-frost">{p.label}</span><span className="text-sm text-teal-electric">{formatPrice(p.priceCents)}</span></div>
              </button>
            ))}
            <Button disabled={busy || !company.proposedName} onClick={() => save({ companyDetails: { ...company, city: "N'Djamena" }, virtualOffice: vo }, 3)}>Continue</Button>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 flex flex-col gap-4">
            <ShareholdersStep value={shareholders} onChange={setShareholders} />
            <Button disabled={busy || shareholders.length === 0} onClick={() => save({ owners: [...shareholders, ...directors] }, 4)}>Continue</Button>
          </div>
        )}

        {step === 4 && (
          <div className="mt-4 flex flex-col gap-4">
            <DirectorsStep value={directors} onChange={setDirectors} />
            <Button disabled={busy || directors.length === 0} onClick={() => save({ owners: [...shareholders, ...directors] }, 5)}>Continue</Button>
          </div>
        )}

        {step === 5 && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">Upload documents</h2>
            {allPeople.map((p, idx) => (
              <div key={idx} className="rounded-xl border border-frost/10 bg-steel/20 p-4">
                <p className="text-sm font-medium text-frost">{p.fullName || 'Person'} <span className="text-frost/50">({p.role})</span></p>
                {PERSON_DOCS.map((d) => (
                  <label key={d.label} className="mt-2 flex flex-col gap-1">
                    <span className="text-sm text-frost/70">{d.label}</span>
                    <input type="file" accept="image/*,application/pdf" className="text-sm text-frost/70" onChange={(e) => e.target.files?.[0] && uploadDoc(d.type, p.fullName, e.target.files[0])} />
                  </label>
                ))}
              </div>
            ))}
            {hasCorporate && (
              <div className="rounded-xl border border-frost/10 bg-steel/20 p-4">
                <p className="text-sm font-medium text-frost">Corporate shareholder documents</p>
                {CORP_DOCS.map((d) => (
                  <label key={d.label} className="mt-2 flex flex-col gap-1">
                    <span className="text-sm text-frost/70">{d.label}</span>
                    <input type="file" accept="image/*,application/pdf" className="text-sm text-frost/70" onChange={(e) => e.target.files?.[0] && uploadDoc(d.type, d.label, e.target.files[0])} />
                  </label>
                ))}
              </div>
            )}
            <Button onClick={() => setStep(6)}>Continue to payment</Button>
          </div>
        )}

        {step === 6 && app && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">Review & pay</h2>
            <div className="rounded-xl border border-frost/10 bg-steel/20 p-5 text-frost">
              <p>{app.companyDetails?.proposedName}</p>
              <p className="text-sm text-frost/55">{ENTITY_TYPES.find((e) => e.value === app.entityType)?.label} · {shareholders.length} shareholder(s) · {directors.length} director(s) · {app.virtualOffice?.wanted ? `VO: ${app.virtualOffice.plan}` : 'no VO'}</p>
              <p className="mt-3 text-xl font-semibold text-teal-electric">{formatPrice(app.priceCents)}</p>
            </div>
            <Button disabled={busy} onClick={payAndSubmit}>{busy ? 'Redirecting…' : 'Pay & submit'}</Button>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Save & finish later</Button>
          </div>
        )}
      </div>
    </div>
  )
}
