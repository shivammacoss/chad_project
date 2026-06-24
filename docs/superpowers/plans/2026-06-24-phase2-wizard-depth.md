# Phase 2 — Formation Wizard Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deepen the formation intake — 3 names, business-activity dropdown, capital details, and **separate Shareholders and Directors** steps with richer fields, composed back into the existing `owners[]`. Generic-service flow and staff workflow untouched.

**Architecture:** Backend only adds optional sub-schema fields (no route changes). Frontend splits the single owners step into `ShareholdersStep` + `DirectorsStep`, enriches the company-details step (keeping the virtual-office choice folded in), and adds corporate-shareholder documents to the KYC step. Wizard stays 6 steps.

**Tech Stack:** Express + TS + MongoDB (`backend/`), Vite/React + TS (`frontend/`), Vitest.

## Global Constraints

- Backend under `backend/`, frontend under `frontend/`. TS ESM / TSX.
- People are stored in `owners[]` with `role: 'shareholder' | 'director' | 'both'`. Shareholders carry `ownershipPercent`; directors carry `dob`. `ownershipPercent` becomes OPTIONAL (directors omit it).
- Formation flow only; the generic-service wizard and `/api/staff` are unchanged. Existing V2/Phase-1/Phase-3 tests stay green.
- Each task ends green and is committed. Backend: `cd backend && npm test`. Frontend: `cd frontend && npm test`.

---

### Task 1: Enrich owners + companyDetails (backend)

**Files:**
- Modify: `backend/src/models/Application.ts`
- Modify: `backend/src/seed.ts`
- Test: `backend/src/__tests__/applications.routes.test.ts` (extend)

**Interfaces:**
- `ownerSchema` gains optional `phone`, `address`, `passportNo`, `idNumber`, `dob` (String), `isCorporate` (Boolean); `ownershipPercent` becomes optional (`default: 0`, keep min/max).
- `companyDetails` gains `alternateName2` (String), `paidUpCapitalFCFA` (Number), `currency` (String, default `'FCFA'`).
- `PATCH /api/applications/:id { owners, companyDetails }` already shallow-merges — no route change. Verify enriched data round-trips.

- [ ] **Step 1: Update `backend/src/models/Application.ts`**

Change `ownerSchema` to:
```ts
const ownerSchema = new Schema(
  {
    fullName: { type: String, required: true },
    role: { type: String, enum: ['director', 'shareholder', 'both'], required: true },
    nationality: { type: String, required: true },
    ownershipPercent: { type: Number, default: 0, min: 0, max: 100 },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    passportNo: { type: String },
    idNumber: { type: String },
    dob: { type: String },
    isCorporate: { type: Boolean, default: false },
    isPrimaryContact: { type: Boolean, default: false },
  },
  { _id: false },
)
```
And extend `companyDetails`:
```ts
  companyDetails: {
    proposedName: { type: String },
    alternateName: { type: String },
    alternateName2: { type: String },
    businessActivity: { type: String },
    shareCapitalFCFA: { type: Number },
    paidUpCapitalFCFA: { type: Number },
    currency: { type: String, default: 'FCFA' },
    city: { type: String, default: "N'Djamena" },
  },
```

- [ ] **Step 2: Enrich the seed** in `backend/src/seed.ts`

In the first formation spec's owners (Sahel Trading SARL), add the new fields to the two owners, e.g.:
```ts
        { fullName: 'Amadou Diallo', role: 'both', nationality: 'Chad', ownershipPercent: 60, isPrimaryContact: true, passportNo: 'TD1234567', phone: '+235 60 00 00 00', dob: '1985-04-12', address: 'Av. Charles de Gaulle, N’Djamena' },
        { fullName: 'Rajesh Kumar', role: 'shareholder', nationality: 'India', ownershipPercent: 40, isPrimaryContact: false, passportNo: 'IN9876543', email: 'rajesh@example.com' },
```
And in that spec's `companyDetails` creation (the loop builds it), set capital fields — change the loop's `companyDetails` to include `paidUpCapitalFCFA: 500000, currency: 'FCFA'`:
```ts
      companyDetails: { proposedName: s.name, businessActivity: 'General trading', shareCapitalFCFA: 1000000, paidUpCapitalFCFA: 500000, currency: 'FCFA', city: "N'Djamena" },
```

- [ ] **Step 3: Extend `backend/src/__tests__/applications.routes.test.ts`** — add a test:
```ts
  it('saves enriched shareholders/directors + capital via PATCH', async () => {
    const agent = await authedAgent()
    const created = await agent.post('/api/applications').send({ entityType: 'SARL', packageTier: 'standard' })
    const res = await agent.patch(`/api/applications/${created.body._id}`).send({
      companyDetails: { proposedName: 'Acme SARL', alternateName2: 'Acme 3', paidUpCapitalFCFA: 500000, currency: 'FCFA' },
      owners: [
        { fullName: 'A', role: 'shareholder', nationality: 'IN', ownershipPercent: 100, passportNo: 'P1', isCorporate: false, isPrimaryContact: true },
        { fullName: 'B', role: 'director', nationality: 'Chad', dob: '1980-01-01', passportNo: 'P2', isPrimaryContact: false },
      ],
      currentStep: 4,
    })
    expect(res.status).toBe(200)
    expect(res.body.companyDetails.paidUpCapitalFCFA).toBe(500000)
    expect(res.body.companyDetails.alternateName2).toBe('Acme 3')
    expect(res.body.owners[1].dob).toBe('1980-01-01')
    expect(res.body.owners[0].passportNo).toBe('P1')
  })
```

- [ ] **Step 4: Run the suite + typecheck — expect ALL green**

Run: `cd backend && npm test && npm run typecheck`

- [ ] **Step 5: Commit**
```bash
git add backend/src/models/Application.ts backend/src/seed.ts backend/src/__tests__/applications.routes.test.ts
git commit -m "feat(backend): enrich owners (passport/dob/corporate) + capital fields"
```

---

### Task 2: Frontend content + types (frontend)

**Files:**
- Modify: `frontend/src/content/formations.ts`
- Modify: `frontend/src/types/app.ts`
- Test: existing status-badge test stays green (run full suite).

**Interfaces:**
- `content/formations.ts` adds `BUSINESS_ACTIVITIES: string[]` and `CURRENCIES: string[]`.
- `types/app.ts`: `Owner` gains optional `phone?`, `address?`, `passportNo?`, `idNumber?`, `dob?`, `isCorporate?`; `ownershipPercent?` becomes optional. `CompanyDetails` gains `alternateName2?`, `paidUpCapitalFCFA?`, `currency?`.

- [ ] **Step 1: Add to `frontend/src/content/formations.ts`**
```ts
export const BUSINESS_ACTIVITIES: string[] = [
  'Trading', 'IT', 'Consulting', 'Import/Export', 'Manufacturing', 'Construction', 'Agriculture', 'Services', 'Other',
]
export const CURRENCIES: string[] = ['FCFA', 'USD', 'EUR']
```

- [ ] **Step 2: Update `frontend/src/types/app.ts`** — change `Owner` and `CompanyDetails`:
```ts
export interface Owner {
  fullName: string; role: OwnerRole; nationality: string
  ownershipPercent?: number; email?: string; phone?: string; address?: string
  passportNo?: string; idNumber?: string; dob?: string; isCorporate?: boolean
  isPrimaryContact: boolean
}
export interface CompanyDetails {
  proposedName: string; alternateName?: string; alternateName2?: string
  businessActivity?: string; shareCapitalFCFA?: number; paidUpCapitalFCFA?: number
  currency?: string; city: string
}
```

- [ ] **Step 3: Run the full suite — expect PASS**

Run: `cd frontend && npm test && npm run build`
Expected: all tests pass, tsc build clean (the optional-field widening should not break existing usage).

- [ ] **Step 4: Commit**
```bash
git add frontend/src/content/formations.ts frontend/src/types/app.ts
git commit -m "feat(web): business-activity/currency content + enriched owner/company types"
```

---

### Task 3: Shareholders + Directors step components (frontend)

**Files:**
- Create: `frontend/src/components/application/ShareholdersStep.tsx`
- Create: `frontend/src/components/application/DirectorsStep.tsx`
- Test: `frontend/src/components/application/__tests__/people-steps.test.tsx`

**Interfaces:**
- `ShareholdersStep({ value, onChange })` — `value: Owner[]` (shareholders), `onChange(next)`. Per row: fullName, isCorporate checkbox, nationality, ownership %, passport no, email, phone, address. Live shareholding total (warn ≠ 100). Add/remove. Each row's `role` is `'shareholder'`.
- `DirectorsStep({ value, onChange })` — per row: fullName, nationality, DOB (date), passport no, email, phone, address. Add/remove. Each row's `role` is `'director'`.

- [ ] **Step 1: Create `frontend/src/components/application/ShareholdersStep.tsx`**
```tsx
import { Button } from '@/components/ui/Button'
import type { Owner } from '@/types/app'

const inputCls = 'rounded-lg border border-frost/15 bg-navy px-3 py-2 text-sm text-frost outline-none focus:border-teal-electric/50'
const blank: Owner = { fullName: '', role: 'shareholder', nationality: '', ownershipPercent: 0, isCorporate: false, isPrimaryContact: false }

export default function ShareholdersStep({ value, onChange }: { value: Owner[]; onChange: (n: Owner[]) => void }) {
  const upd = (i: number, p: Partial<Owner>) => onChange(value.map((o, idx) => (idx === i ? { ...o, ...p } : o)))
  const add = () => onChange([...value, { ...blank, isPrimaryContact: value.length === 0 }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const total = value.reduce((s, o) => s + (Number(o.ownershipPercent) || 0), 0)
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-frost">Shareholders</h2>
      {value.length === 0 && <p className="text-sm text-frost/55">Add at least one shareholder.</p>}
      {value.map((o, i) => (
        <div key={i} className="rounded-xl border border-frost/10 bg-steel/20 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <input className={inputCls} placeholder="Full name / company" value={o.fullName} onChange={(e) => upd(i, { fullName: e.target.value })} />
            <input className={inputCls} placeholder="Nationality" value={o.nationality} onChange={(e) => upd(i, { nationality: e.target.value })} />
            <input className={inputCls} type="number" placeholder="Ownership %" value={o.ownershipPercent ?? 0} onChange={(e) => upd(i, { ownershipPercent: Number(e.target.value) })} />
            <input className={inputCls} placeholder="Passport / Reg no" value={o.passportNo ?? ''} onChange={(e) => upd(i, { passportNo: e.target.value })} />
            <input className={inputCls} placeholder="Email" value={o.email ?? ''} onChange={(e) => upd(i, { email: e.target.value })} />
            <input className={inputCls} placeholder="Phone" value={o.phone ?? ''} onChange={(e) => upd(i, { phone: e.target.value })} />
            <input className={`${inputCls} sm:col-span-2`} placeholder="Address" value={o.address ?? ''} onChange={(e) => upd(i, { address: e.target.value })} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-frost/70">
              <input type="checkbox" checked={o.isCorporate ?? false} onChange={(e) => upd(i, { isCorporate: e.target.checked })} /> Shareholder is a company
            </label>
            <button type="button" className="text-sm text-indigo-pulse" onClick={() => remove(i)}>Remove</button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={add}>+ Add shareholder</Button>
        <span className={total === 100 ? 'text-sm text-teal-electric' : 'text-sm text-indigo-pulse'}>Shareholding total: {total}%</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `frontend/src/components/application/DirectorsStep.tsx`**
```tsx
import { Button } from '@/components/ui/Button'
import type { Owner } from '@/types/app'

const inputCls = 'rounded-lg border border-frost/15 bg-navy px-3 py-2 text-sm text-frost outline-none focus:border-teal-electric/50'
const blank: Owner = { fullName: '', role: 'director', nationality: '', isPrimaryContact: false }

export default function DirectorsStep({ value, onChange }: { value: Owner[]; onChange: (n: Owner[]) => void }) {
  const upd = (i: number, p: Partial<Owner>) => onChange(value.map((o, idx) => (idx === i ? { ...o, ...p } : o)))
  const add = () => onChange([...value, { ...blank }])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-frost">Directors</h2>
      {value.length === 0 && <p className="text-sm text-frost/55">Add at least one director.</p>}
      {value.map((o, i) => (
        <div key={i} className="rounded-xl border border-frost/10 bg-steel/20 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <input className={inputCls} placeholder="Full name" value={o.fullName} onChange={(e) => upd(i, { fullName: e.target.value })} />
            <input className={inputCls} placeholder="Nationality" value={o.nationality} onChange={(e) => upd(i, { nationality: e.target.value })} />
            <label className="flex flex-col gap-1 text-xs text-frost/55">Date of birth
              <input className={inputCls} type="date" value={o.dob ?? ''} onChange={(e) => upd(i, { dob: e.target.value })} />
            </label>
            <input className={inputCls} placeholder="Passport no" value={o.passportNo ?? ''} onChange={(e) => upd(i, { passportNo: e.target.value })} />
            <input className={inputCls} placeholder="Email" value={o.email ?? ''} onChange={(e) => upd(i, { email: e.target.value })} />
            <input className={inputCls} placeholder="Phone" value={o.phone ?? ''} onChange={(e) => upd(i, { phone: e.target.value })} />
            <input className={`${inputCls} sm:col-span-2`} placeholder="Address" value={o.address ?? ''} onChange={(e) => upd(i, { address: e.target.value })} />
          </div>
          <div className="mt-2 flex justify-end"><button type="button" className="text-sm text-indigo-pulse" onClick={() => remove(i)}>Remove</button></div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add}>+ Add director</Button>
    </div>
  )
}
```

- [ ] **Step 3: Write the failing test `frontend/src/components/application/__tests__/people-steps.test.tsx`**
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShareholdersStep from '../ShareholdersStep'
import DirectorsStep from '../DirectorsStep'
import type { Owner } from '@/types/app'

describe('people steps', () => {
  it('ShareholdersStep adds a shareholder and shows total', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<ShareholdersStep value={[]} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /add shareholder/i }))
    expect(onChange).toHaveBeenCalled()
    rerender(<ShareholdersStep value={[{ fullName: 'A', role: 'shareholder', nationality: 'IN', ownershipPercent: 100, isPrimaryContact: true }] as Owner[]} onChange={onChange} />)
    expect(screen.getByText(/Shareholding total: 100%/)).toBeInTheDocument()
  })
  it('DirectorsStep adds a director with DOB field', async () => {
    const onChange = vi.fn()
    render(<DirectorsStep value={[{ fullName: 'D', role: 'director', nationality: 'Chad', isPrimaryContact: false }] as Owner[]} onChange={onChange} />)
    expect(screen.getByText(/Date of birth/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run it — expect PASS**

Run: `cd frontend && npm test src/components/application/__tests__/people-steps.test.tsx`

- [ ] **Step 5: Commit**
```bash
git add frontend/src/components/application/ShareholdersStep.tsx frontend/src/components/application/DirectorsStep.tsx frontend/src/components/application/__tests__/people-steps.test.tsx
git commit -m "feat(web): separate Shareholders and Directors step components"
```

---

### Task 4: Rebuild the formation wizard (6 deep steps) (frontend)

**Files:**
- Modify: `frontend/src/pages/ApplicationWizardPage.tsx`
- Test: `frontend/src/pages/__tests__/application-wizard.test.tsx` (keep green; update if needed)

**Interfaces:**
- 6 steps: (1) entity & package → creates draft; (2) **company details + virtual office** (3 names, activity dropdown, share & paid-up capital, currency, then VO choice from `VO_PLANS`) → PATCH companyDetails + virtualOffice; (3) **Shareholders** (ShareholdersStep) → local state; (4) **Directors** (DirectorsStep) → on continue, compose `owners = [...shareholders, ...directors]` and PATCH owners; (5) **KYC** — per person (shareholders + directors); if any shareholder `isCorporate`, also corporate documents; (6) review + pay (unchanged checkout).

- [ ] **Step 1: Rewrite `frontend/src/pages/ApplicationWizardPage.tsx`**
```tsx
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
```

- [ ] **Step 2: Update `frontend/src/pages/__tests__/application-wizard.test.tsx`** — the existing test drives step 1 → 2; it should still pass (step 2 now shows "Company details"). Confirm the assertion `findByText(/company details/i)` still matches. If the test asserted a "Proposed company name" placeholder, update it to "Preferred name 1". Minimal edit only.

- [ ] **Step 3: Run it — expect PASS**

Run: `cd frontend && npm test src/pages/__tests__/application-wizard.test.tsx`

- [ ] **Step 4: Commit**
```bash
git add frontend/src/pages/ApplicationWizardPage.tsx frontend/src/pages/__tests__/application-wizard.test.tsx
git commit -m "feat(web): deep 6-step formation wizard (company depth, shareholders, directors, corporate KYC)"
```

---

### Task 5: Detail + admin person grouping + full green (frontend)

**Files:**
- Modify: `frontend/src/pages/ApplicationDetailPage.tsx`
- Modify: `frontend/src/pages/AdminPage.tsx`
- Modify: `frontend/src/components/staff/LegalPanel.tsx` (optional, only if it lists owners)
- Test: full suites + build.

**Interfaces:**
- Detail + admin owner rows show the extra fields when present (DOB for directors, phone) and a "company" tag for `isCorporate`. Group is optional; minimal additive display is acceptable.

- [ ] **Step 1: `ApplicationDetailPage.tsx`** — in the owners list row, append optional fields:
```tsx
<span className="text-frost/60">{o.nationality} · {o.role === 'director' ? (o.dob ? `DOB ${o.dob}` : 'director') : `${o.ownershipPercent ?? 0}%`}{o.isCorporate ? ' · company' : ''}{o.isPrimaryContact ? ' · primary' : ''}</span>
```
Also show company capital in the company block:
```tsx
<p>Capital: {a.companyDetails?.shareCapitalFCFA?.toLocaleString() ?? '—'} {a.companyDetails?.currency ?? 'FCFA'} (paid-up {a.companyDetails?.paidUpCapitalFCFA?.toLocaleString() ?? '—'})</p>
```

- [ ] **Step 2: `AdminPage.tsx`** — in the owners list (detail pane), use the same enriched row line as above.

- [ ] **Step 3: Full green**

Run:
```bash
cd backend && npm test && npm run typecheck
cd frontend && npm test && npm run build && npm run lint
```
Expected: all pass, typecheck clean, build clean, 0 lint warnings. Fix any breakage minimally (especially optional-field access with `?.`).

- [ ] **Step 4: Commit**
```bash
git add frontend/src
git commit -m "feat(web): show enriched person + capital fields in detail/admin; phase 2 green"
```

---

## Self-Review Notes (coverage vs design §2–§5)

- Enriched owners + companyDetails (capital, 3rd name) → Task 1, 2. ✅
- Business-activity dropdown + currencies → Task 2, 4. ✅
- Separate Shareholders + Directors steps → Task 3, 4. ✅
- Corporate-shareholder documents in KYC → Task 4. ✅
- Capital (share + paid-up + currency) → Task 4 (company step). ✅
- Virtual office retained (folded into company step) → Task 4. ✅
- Detail/admin enriched display → Task 5. ✅
- Generic flow + staff workflow untouched → additive only. ✅
