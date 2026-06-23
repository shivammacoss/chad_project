import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import OwnersStep from '@/components/application/OwnersStep'
import { ENTITY_TYPES, ENTITY_PRICE_CENTS, VO_PLANS, formatPrice } from '@/content/formations'
import { apiPost, apiPatch, apiUpload, ApiError } from '@/lib/api'
import type { Application, EntityType, Owner, DocType, VoPlan } from '@/types/app'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'
const DOC_FIELDS: { type: DocType; label: string }[] = [
  { type: 'passport', label: 'Passport' }, { type: 'address_proof', label: 'Proof of address' }, { type: 'photo', label: 'Photo' },
]

export default function ApplicationWizardPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [app, setApp] = useState<Application | null>(null)
  const [entityType, setEntityType] = useState<EntityType>('SARL')
  const [company, setCompany] = useState({ proposedName: '', businessActivity: '', shareCapitalFCFA: 100000 })
  const [owners, setOwners] = useState<Owner[]>([])
  const [vo, setVo] = useState<{ wanted: boolean; plan?: VoPlan }>({ wanted: false })
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)

  async function save(patch: Record<string, unknown>, nextStep: number) {
    if (!app) return
    setBusy(true); setError('')
    try { const updated = await apiPatch<Application>(`/api/applications/${app._id}`, { ...patch, currentStep: nextStep }); setApp(updated); setStep(nextStep) }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Could not save') }
    finally { setBusy(false) }
  }

  async function createApp() {
    setBusy(true); setError('')
    try { const created = await apiPost<Application>('/api/applications', { entityType, packageTier: 'standard' }); setApp(created); setStep(2) }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Could not start') }
    finally { setBusy(false) }
  }

  async function uploadDoc(type: DocType, ownerName: string, file: File) {
    if (!app) return
    const form = new FormData(); form.append('type', type); form.append('ownerName', ownerName); form.append('file', file)
    try { await apiUpload(`/api/applications/${app._id}/documents`, form) }
    catch { setError('Upload failed — check file type (jpg/png/webp/pdf) and size (<=10MB).') }
  }

  async function payAndSubmit() {
    if (!app) return
    setBusy(true); setError('')
    try { const { url } = await apiPost<{ url: string }>(`/api/applications/${app._id}/checkout`); if (!url) { setError('Checkout unavailable'); setBusy(false); return } window.location.href = url }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Checkout failed'); setBusy(false) }
  }

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
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">Company details</h2>
            <input className={inputCls} placeholder="Proposed company name" value={company.proposedName} onChange={(e) => setCompany({ ...company, proposedName: e.target.value })} />
            <input className={inputCls} placeholder="Business activity" value={company.businessActivity} onChange={(e) => setCompany({ ...company, businessActivity: e.target.value })} />
            <input className={inputCls} type="number" placeholder="Share capital (FCFA)" value={company.shareCapitalFCFA} onChange={(e) => setCompany({ ...company, shareCapitalFCFA: Number(e.target.value) })} />
            <Button disabled={busy || !company.proposedName} onClick={() => save({ companyDetails: { ...company, city: "N'Djamena" } }, 3)}>Continue</Button>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4 flex flex-col gap-4">
            <OwnersStep owners={owners} onChange={setOwners} />
            <Button disabled={busy || owners.length === 0} onClick={() => save({ owners }, 4)}>Continue</Button>
          </div>
        )}

        {step === 4 && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">Virtual office</h2>
            <button type="button" onClick={() => setVo({ wanted: false })} className={`rounded-xl border px-5 py-4 text-left ${!vo.wanted ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
              <span className="font-medium text-frost">No, I have my own address</span>
            </button>
            {VO_PLANS.map((p) => (
              <button key={p.value} type="button" onClick={() => setVo({ wanted: true, plan: p.value })}
                className={`rounded-xl border px-5 py-4 text-left ${vo.wanted && vo.plan === p.value ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
                <div className="flex justify-between"><span className="font-medium text-frost">{p.label}</span><span className="text-sm text-teal-electric">{formatPrice(p.priceCents)}</span></div>
                <span className="text-sm text-frost/55">{p.blurb}</span>
              </button>
            ))}
            <Button disabled={busy} onClick={() => save({ virtualOffice: vo }, 5)}>Continue</Button>
          </div>
        )}

        {step === 5 && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">Upload documents</h2>
            {owners.length === 0 && <p className="text-sm text-frost/55">No owners added — you can still proceed.</p>}
            {owners.map((o, i) => (
              <div key={i} className="rounded-xl border border-frost/10 bg-steel/20 p-4">
                <p className="text-sm font-medium text-frost">{o.fullName || 'Owner'}</p>
                {DOC_FIELDS.map((d) => (
                  <label key={d.type} className="mt-2 flex flex-col gap-1">
                    <span className="text-sm text-frost/70">{d.label}</span>
                    <input type="file" accept="image/*,application/pdf" className="text-sm text-frost/70"
                      onChange={(e) => e.target.files?.[0] && uploadDoc(d.type, o.fullName, e.target.files[0])} />
                  </label>
                ))}
              </div>
            ))}
            <Button onClick={() => setStep(6)}>Continue to payment</Button>
          </div>
        )}

        {step === 6 && app && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-frost">Review & pay</h2>
            <div className="rounded-xl border border-frost/10 bg-steel/20 p-5 text-frost">
              <p>{app.companyDetails?.proposedName}</p>
              <p className="text-sm text-frost/55">{ENTITY_TYPES.find((e) => e.value === app.entityType)?.label} · {app.owners?.length ?? 0} owner(s) · {app.virtualOffice?.wanted ? `VO: ${app.virtualOffice.plan}` : 'no virtual office'}</p>
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
