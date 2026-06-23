import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ENTITY_TYPES, formatPrice } from '@/content/formations'
import { apiPost, apiUpload, ApiError } from '@/lib/api'
import type { EntityType, Formation, DocType } from '@/types/app'

const inputCls =
  'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

const DOC_FIELDS: { type: DocType; label: string }[] = [
  { type: 'passport', label: 'Passport' },
  { type: 'address_proof', label: 'Proof of address' },
  { type: 'photo', label: 'Passport photo' },
]

export default function FormationWizardPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [entityType, setEntityType] = useState<EntityType>('SARL')
  const [companyName, setCompanyName] = useState('')
  const [formation, setFormation] = useState<Formation | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function createFormation() {
    setError(''); setBusy(true)
    try {
      const f = await apiPost<Formation>('/api/formations', { entityType, companyName, packageTier: 'standard' })
      setFormation(f)
      setStep(2)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create formation')
    } finally { setBusy(false) }
  }

  async function uploadDoc(type: DocType, file: File) {
    if (!formation) return
    const form = new FormData()
    form.append('type', type)
    form.append('file', file)
    await apiUpload(`/api/formations/${formation._id}/documents`, form)
  }

  async function payAndSubmit() {
    if (!formation) return
    setBusy(true)
    try {
      const { url } = await apiPost<{ url: string }>(`/api/formations/${formation._id}/checkout`)
      window.location.href = url
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Checkout failed')
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <p className="text-sm text-frost/55">Step {step} of 3</p>

        {step === 1 && (
          <div className="mt-4 flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-frost">Choose your entity</h1>
            <div className="grid gap-3">
              {ENTITY_TYPES.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => setEntityType(e.value)}
                  className={`rounded-xl border px-5 py-4 text-left ${entityType === e.value ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}
                >
                  <p className="font-medium text-frost">{e.label}</p>
                  <p className="text-sm text-frost/55">{e.blurb}</p>
                </button>
              ))}
            </div>
            <input className={inputCls} placeholder="Proposed company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            {error && <p className="text-sm text-indigo-pulse">{error}</p>}
            <Button disabled={!companyName || busy} onClick={createFormation}>Continue</Button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-frost">Upload your documents</h1>
            {DOC_FIELDS.map((d) => (
              <label key={d.type} className="flex flex-col gap-2 rounded-xl border border-frost/10 bg-steel/20 px-5 py-4">
                <span className="text-sm text-frost">{d.label}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="text-sm text-frost/70"
                  onChange={(e) => e.target.files?.[0] && uploadDoc(d.type, e.target.files[0])}
                />
              </label>
            ))}
            <Button onClick={() => setStep(3)}>Continue to payment</Button>
          </div>
        )}

        {step === 3 && formation && (
          <div className="mt-4 flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-frost">Review & pay</h1>
            <div className="rounded-xl border border-frost/10 bg-steel/20 p-5 text-frost">
              <p>{formation.companyName}</p>
              <p className="text-sm text-frost/55">{ENTITY_TYPES.find((e) => e.value === formation.entityType)?.label}</p>
              <p className="mt-3 text-xl font-semibold text-teal-electric">{formatPrice(formation.priceCents)}</p>
            </div>
            {error && <p className="text-sm text-indigo-pulse">{error}</p>}
            <Button disabled={busy} onClick={payAndSubmit}>{busy ? 'Redirecting…' : 'Pay & submit'}</Button>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Save & finish later</Button>
          </div>
        )}
      </div>
    </div>
  )
}
