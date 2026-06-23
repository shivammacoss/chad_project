# V2 Phase C — User-Facing Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the user-facing frontend for the rich V2 backend — landing "Get Started" → entity/package pick + signup, login-only `/login`, a 7-step application wizard (company details, multi-owner/director with shareholding, virtual office add-on, per-owner KYC, review + pay), and an application detail/track page.

**Architecture:** Runs after Phase B (backend uses `Application`, route base `/api/applications`, signup takes `phone`). Frontend lives at `frontend/`. The old `Formation*` pages are replaced by `Application*` pages; the API base is `applications`. Wizard steps are small focused components. Admin (separate login + review) is Phase D, not here.

**Tech Stack:** React 18, react-router-dom 6, TypeScript, Tailwind (existing tokens), Vitest + RTL.

## Global Constraints

- All paths under `frontend/`. Reuse `Button`, `Badge`, `StatusBadge`, `cn`, `AuthContext`, `api` client. No new UI library.
- API base is `/api/applications`. Endpoints: `POST /api/applications` {entityType, packageTier}; `PATCH /api/applications/:id` {companyDetails?, owners?, virtualOffice?, currentStep?}; `GET /api/applications`; `GET /api/applications/:id`; `POST /api/applications/:id/documents` (multipart file, type, ownerName); `GET /api/applications/:id/documents`; `POST /api/applications/:id/checkout`. Signup: `POST /api/auth/signup` {fullName, email, country, phone, password}.
- Entity types exactly `SARL|SARL_U|SA|BRANCH|REP_OFFICE`. Owner roles exactly `director|shareholder|both`. Doc types `passport|address_proof|photo|other`. VO plans `basic|premium`.
- Each task ends green: `cd frontend && npm test` (and `npm run build` on the final task).

---

### Task 1: Shared types + content for applications

**Files:**
- Modify: `frontend/src/types/app.ts`
- Modify: `frontend/src/content/formations.ts`
- Modify: `frontend/src/components/formations/StatusBadge.tsx` (rename type usage)
- Test: `frontend/src/components/formations/__tests__/status-badge.test.tsx` (already exists; keep passing)

**Interfaces:**
- Produces in `types/app.ts`: `Owner`, `VirtualOffice`, `CompanyDetails`, `Application` (replacing `Formation`), keep `AuthUser`, `DocItem` (add `ownerName`). Rename `FormationStatus` → `ApplicationStatus` (same 9 values).
- Produces in `content/formations.ts`: keep `ENTITY_TYPES`, `STATUS_LABEL`, `formatPrice`; add `ENTITY_PRICE_CENTS` (display base), `VO_PLANS` (`{value, label, priceCents}`), `OWNER_ROLES`.

- [ ] **Step 1: Rewrite `frontend/src/types/app.ts`**

```ts
export type EntityType = 'SARL' | 'SARL_U' | 'SA' | 'BRANCH' | 'REP_OFFICE'
export type ApplicationStatus =
  | 'draft' | 'documents_submitted' | 'payment_pending' | 'paid'
  | 'in_review' | 'filing_submitted' | 'registered' | 'needs_more_docs' | 'rejected'
export type DocType = 'passport' | 'address_proof' | 'photo' | 'other'
export type OwnerRole = 'director' | 'shareholder' | 'both'
export type VoPlan = 'basic' | 'premium'

export interface AuthUser { id: string; email: string; fullName: string; country?: string; role: 'user' | 'admin' }

export interface Owner {
  fullName: string; role: OwnerRole; nationality: string
  ownershipPercent: number; email?: string; isPrimaryContact: boolean
}
export interface CompanyDetails {
  proposedName: string; alternateName?: string; businessActivity?: string
  shareCapitalFCFA?: number; city: string
}
export interface VirtualOffice { wanted: boolean; plan?: VoPlan }

export interface Application {
  _id: string; entityType: EntityType; packageTier: 'standard' | 'premium'
  companyDetails: CompanyDetails; owners: Owner[]; virtualOffice: VirtualOffice
  priceCents: number; status: ApplicationStatus; paymentStatus: 'unpaid' | 'paid'
  statusHistory: { status: string; note?: string; at: string }[]
  currentStep: number; createdAt: string
  userId?: string | { _id: string; email: string; fullName: string }
}
export interface DocItem {
  _id: string; type: DocType; ownerName?: string; fileName: string
  status: 'pending' | 'approved' | 'rejected'; uploadedAt: string
}
```

- [ ] **Step 2: Update `frontend/src/content/formations.ts`**

Replace the `import type { ... FormationStatus }` with `ApplicationStatus`, change `STATUS_LABEL` type to `Record<ApplicationStatus, string>`, and append:

```ts
import type { EntityType, ApplicationStatus, OwnerRole, VoPlan } from '@/types/app'

// (ENTITY_TYPES unchanged)

export const ENTITY_PRICE_CENTS: Record<EntityType, number> = {
  SARL: 49900, SARL_U: 39900, SA: 99900, BRANCH: 79900, REP_OFFICE: 59900,
}

export const VO_PLANS: { value: VoPlan; label: string; priceCents: number; blurb: string }[] = [
  { value: 'basic', label: 'Basic registered office', priceCents: 20000, blurb: 'A compliant registered address in N’Djamena with mail receipt.' },
  { value: 'premium', label: 'Premium office', priceCents: 50000, blurb: 'Registered address plus mail forwarding and call handling.' },
]

export const OWNER_ROLES: { value: OwnerRole; label: string }[] = [
  { value: 'director', label: 'Director' },
  { value: 'shareholder', label: 'Shareholder' },
  { value: 'both', label: 'Director & Shareholder' },
]
```
(Keep `STATUS_LABEL` values identical; only its key type changes to `ApplicationStatus`.)

- [ ] **Step 3: Update `StatusBadge.tsx` to import `ApplicationStatus`**

Change `import type { FormationStatus }` → `import type { ApplicationStatus }` and replace the two `FormationStatus` usages (the `Record<...>` and the prop) with `ApplicationStatus`. No logic change.

- [ ] **Step 4: Run the existing status-badge test — expect PASS**

Run: `cd frontend && npm test src/components/formations/__tests__/status-badge.test.tsx`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/types/app.ts frontend/src/content/formations.ts frontend/src/components/formations/StatusBadge.tsx
git commit -m "feat(web): application types + virtual-office/owner content"
```

---

### Task 2: Login-only page + Get Started (entity pick + signup)

**Files:**
- Modify: `frontend/src/pages/LoginPage.tsx` (remove signup link → "Get Started")
- Create: `frontend/src/pages/GetStartedPage.tsx`
- Delete: `frontend/src/pages/SignupPage.tsx`
- Modify: `frontend/src/routes/AppRoutes.tsx` (`/get-started`, drop `/signup`)
- Test: `frontend/src/pages/__tests__/get-started.test.tsx`

**Interfaces:**
- `GetStartedPage`: step 1 choose entity (from `ENTITY_TYPES`, price from `ENTITY_PRICE_CENTS`) + tier; step 2 signup form (fullName, email, country, phone, password) → `apiPost('/api/auth/signup', {...})` → "check your inbox" state. The chosen entity/tier are passed to `/login` via a note; after login the user starts the wizard.

- [ ] **Step 1: Edit `LoginPage.tsx`** — replace the "No account? Sign up" line with:
```tsx
<p className="text-center text-sm text-frost/55">
  New here? <Link to="/get-started" className="text-teal-electric">Get started</Link>
</p>
```

- [ ] **Step 2: Create `frontend/src/pages/GetStartedPage.tsx`**

```tsx
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import AuthShell from '@/components/auth/AuthShell'
import { ENTITY_TYPES, ENTITY_PRICE_CENTS, formatPrice } from '@/content/formations'
import { apiPost, ApiError } from '@/lib/api'
import type { EntityType } from '@/types/app'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function GetStartedPage() {
  const [step, setStep] = useState(1)
  const [entityType, setEntityType] = useState<EntityType>('SARL')
  const [form, setForm] = useState({ fullName: '', email: '', country: '', phone: '', password: '' })
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setError(''); setBusy(true)
    try { await apiPost('/api/auth/signup', form); setDone(true) }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Signup failed') }
    finally { setBusy(false) }
  }

  if (done) {
    return (
      <AuthShell title="Check your inbox" subtitle={`We sent a verification link to ${form.email}.`}>
        <p className="text-sm text-frost/70">Verify your email, then log in to complete your {entityType} application.</p>
        <Link to="/login" className="mt-4 inline-block text-teal-electric">Go to login</Link>
      </AuthShell>
    )
  }

  if (step === 1) {
    return (
      <AuthShell title="Start your company in Chad" subtitle="Choose what you want to register">
        <div className="flex flex-col gap-3">
          {ENTITY_TYPES.map((en) => (
            <button key={en.value} type="button" onClick={() => setEntityType(en.value)}
              className={`rounded-xl border px-5 py-4 text-left ${entityType === en.value ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-frost">{en.label}</span>
                <span className="text-sm text-teal-electric">{formatPrice(ENTITY_PRICE_CENTS[en.value])}</span>
              </div>
              <span className="text-sm text-frost/55">{en.blurb}</span>
            </button>
          ))}
          <Button onClick={() => setStep(2)}>Continue</Button>
          <p className="text-center text-sm text-frost/55">Have an account? <Link to="/login" className="text-teal-electric">Log in</Link></p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create your account" subtitle={`Registering: ${entityType}`}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input className={inputCls} placeholder="Full name" value={form.fullName} onChange={set('fullName')} required />
        <input className={inputCls} type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input className={inputCls} placeholder="Country" value={form.country} onChange={set('country')} required />
        <input className={inputCls} placeholder="Phone" value={form.phone} onChange={set('phone')} />
        <input className={inputCls} type="password" placeholder="Password (min 8)" minLength={8} value={form.password} onChange={set('password')} required />
        {error && <p className="text-sm text-indigo-pulse">{error}</p>}
        <Button type="submit" fullWidth disabled={busy}>{busy ? 'Creating…' : 'Create account'}</Button>
        <button type="button" className="text-sm text-frost/55" onClick={() => setStep(1)}>← Back</button>
      </form>
    </AuthShell>
  )
}
```

- [ ] **Step 3: Update `AppRoutes.tsx`** — remove the `SignupPage` import + `/signup` route; add:
```tsx
import GetStartedPage from '@/pages/GetStartedPage'
// inside MainLayout block:
<Route path="/get-started" element={<GetStartedPage />} />
```

- [ ] **Step 4: Delete `frontend/src/pages/SignupPage.tsx`**
```bash
git rm frontend/src/pages/SignupPage.tsx
```
(If a `login.test.tsx` referenced SignupPage, it does not — only LoginPage. Leave login test as-is.)

- [ ] **Step 5: Write the failing test `frontend/src/pages/__tests__/get-started.test.tsx`**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import GetStartedPage from '../GetStartedPage'

afterEach(() => vi.restoreAllMocks())

describe('GetStartedPage', () => {
  it('picks an entity then submits signup with phone', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    render(<MemoryRouter><GetStartedPage /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await userEvent.type(screen.getByPlaceholderText('Full name'), 'Jo')
    await userEvent.type(screen.getByPlaceholderText('Email'), 'jo@x.com')
    await userEvent.type(screen.getByPlaceholderText('Country'), 'India')
    await userEvent.type(screen.getByPlaceholderText('Phone'), '+91 99999')
    await userEvent.type(screen.getByPlaceholderText('Password (min 8)'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/signup', expect.objectContaining({ method: 'POST' }))
    expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run it — expect PASS**

Run: `cd frontend && npm test src/pages/__tests__/get-started.test.tsx`

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/LoginPage.tsx frontend/src/pages/GetStartedPage.tsx frontend/src/routes/AppRoutes.tsx frontend/src/pages/__tests__/get-started.test.tsx
git rm --cached frontend/src/pages/SignupPage.tsx 2>/dev/null || true
git commit -m "feat(web): login-only page + Get Started (entity pick + signup)"
```

---

### Task 3: Dashboard on applications

**Files:**
- Modify: `frontend/src/pages/DashboardPage.tsx`
- Test: `frontend/src/pages/__tests__/dashboard.test.tsx` (update)

**Interfaces:**
- Consumes `apiGet<Application[]>('/api/applications')`. Cards show `companyDetails.proposedName`, entity label, status badge, price; "Start application" → `/applications/new`; empty state; logout.

- [ ] **Step 1: Rewrite `DashboardPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { ENTITY_TYPES, formatPrice } from '@/content/formations'
import { apiGet } from '@/lib/api'
import { useAuth } from '@/store/AuthContext'
import type { Application } from '@/types/app'

const entityLabel = (v: string) => ENTITY_TYPES.find((e) => e.value === v)?.label ?? v

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [items, setItems] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<Application[]>('/api/applications').then(setItems).catch(() => setItems([])).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-4 border-b border-frost/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-frost">Hi {user?.fullName}</h1>
            <p className="mt-1 text-sm text-frost/55">Your company applications in Chad.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/applications/new"><Button>Start application</Button></Link>
            <Button variant="ghost" onClick={() => logout()}>Log out</Button>
          </div>
        </div>
        {loading ? <p className="mt-10 text-frost/55">Loading…</p>
          : items.length === 0 ? (
            <div className="mt-10 rounded-xl border border-frost/10 bg-steel/20 p-10 text-center">
              <p className="text-frost/70">No applications yet.</p>
              <Link to="/applications/new" className="mt-4 inline-block"><Button>Start your first application</Button></Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              {items.map((a) => (
                <Link key={a._id} to={`/applications/${a._id}`}
                  className="flex items-center justify-between rounded-xl border border-frost/10 bg-steel/20 px-6 py-5 transition-colors hover:border-teal-electric/30">
                  <div>
                    <p className="font-medium text-frost">{a.companyDetails?.proposedName || 'Untitled'}</p>
                    <p className="text-sm text-frost/55">{entityLabel(a.entityType)} · {formatPrice(a.priceCents)}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </Link>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `dashboard.test.tsx`** — change the `/api/formations` mock to `/api/applications` and the formation object to an application with `companyDetails: { proposedName: 'Acme SARL', city: "N'Djamena" }`, `owners: []`, `virtualOffice: { wanted: false }`, `currentStep: 1`. Assert `Acme SARL` and `Registered` render. Full file:

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from '../DashboardPage'
import { AuthProvider } from '@/store/AuthContext'

afterEach(() => vi.restoreAllMocks())

describe('DashboardPage', () => {
  it('lists the user applications', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('/api/auth/me')) return new Response(JSON.stringify({ id: '1', email: 'a@x.com', fullName: 'Jo', role: 'user' }), { status: 200 })
      if (url.includes('/api/applications')) return new Response(JSON.stringify([
        { _id: 'a1', entityType: 'SARL', packageTier: 'standard', companyDetails: { proposedName: 'Acme SARL', city: "N'Djamena" }, owners: [], virtualOffice: { wanted: false }, priceCents: 49900, status: 'registered', paymentStatus: 'paid', statusHistory: [], currentStep: 7, createdAt: '' },
      ]), { status: 200 })
      return new Response('[]', { status: 200 })
    }))
    render(<MemoryRouter><AuthProvider><DashboardPage /></AuthProvider></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Acme SARL')).toBeInTheDocument())
    expect(screen.getByText('Registered')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run it — expect PASS**

Run: `cd frontend && npm test src/pages/__tests__/dashboard.test.tsx`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/DashboardPage.tsx frontend/src/pages/__tests__/dashboard.test.tsx
git commit -m "feat(web): dashboard on applications"
```

---

### Task 4: Owners step component (add/remove multi-owner + percent total)

**Files:**
- Create: `frontend/src/components/application/OwnersStep.tsx`
- Test: `frontend/src/components/application/__tests__/owners-step.test.tsx`

**Interfaces:**
- Produces `OwnersStep({ owners, onChange })` where `owners: Owner[]` and `onChange(next: Owner[])`. Renders one editable row per owner (fullName, role select, nationality, ownershipPercent, primary-contact radio), an "Add owner" button, a remove button per row, and a live shareholding total with a warning when it is not 100.

- [ ] **Step 1: Create `frontend/src/components/application/OwnersStep.tsx`**

```tsx
import { OWNER_ROLES } from '@/content/formations'
import { Button } from '@/components/ui/Button'
import type { Owner } from '@/types/app'

const inputCls = 'rounded-lg border border-frost/15 bg-navy px-3 py-2 text-sm text-frost outline-none focus:border-teal-electric/50'
const blank: Owner = { fullName: '', role: 'both', nationality: '', ownershipPercent: 0, isPrimaryContact: false }

export default function OwnersStep({ owners, onChange }: { owners: Owner[]; onChange: (next: Owner[]) => void }) {
  const update = (i: number, patch: Partial<Owner>) => onChange(owners.map((o, idx) => (idx === i ? { ...o, ...patch } : (patch.isPrimaryContact ? { ...o, isPrimaryContact: false } : o))))
  const add = () => onChange([...owners, { ...blank, isPrimaryContact: owners.length === 0 }])
  const remove = (i: number) => onChange(owners.filter((_, idx) => idx !== i))
  const total = owners.reduce((s, o) => s + (Number(o.ownershipPercent) || 0), 0)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-frost">Owners & directors</h2>
      {owners.length === 0 && <p className="text-sm text-frost/55">Add at least one owner.</p>}
      {owners.map((o, i) => (
        <div key={i} className="rounded-xl border border-frost/10 bg-steel/20 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <input className={inputCls} placeholder="Full name" value={o.fullName} onChange={(e) => update(i, { fullName: e.target.value })} />
            <select className={inputCls} value={o.role} onChange={(e) => update(i, { role: e.target.value as Owner['role'] })}>
              {OWNER_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <input className={inputCls} placeholder="Nationality" value={o.nationality} onChange={(e) => update(i, { nationality: e.target.value })} />
            <input className={inputCls} type="number" placeholder="Ownership %" value={o.ownershipPercent} onChange={(e) => update(i, { ownershipPercent: Number(e.target.value) })} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-frost/70">
              <input type="radio" name="primary" checked={o.isPrimaryContact} onChange={() => update(i, { isPrimaryContact: true })} /> Primary contact
            </label>
            <button type="button" className="text-sm text-indigo-pulse" onClick={() => remove(i)}>Remove</button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={add}>+ Add owner</Button>
        <span className={total === 100 ? 'text-sm text-teal-electric' : 'text-sm text-indigo-pulse'}>Shareholding total: {total}%</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write the failing test `frontend/src/components/application/__tests__/owners-step.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OwnersStep from '../OwnersStep'
import type { Owner } from '@/types/app'

describe('OwnersStep', () => {
  it('adds an owner and reports the shareholding total', async () => {
    let owners: Owner[] = []
    const onChange = vi.fn((next: Owner[]) => { owners = next })
    const { rerender } = render(<OwnersStep owners={owners} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /add owner/i }))
    expect(onChange).toHaveBeenCalled()
    rerender(<OwnersStep owners={[{ fullName: 'A', role: 'both', nationality: 'IN', ownershipPercent: 100, isPrimaryContact: true }]} onChange={onChange} />)
    expect(screen.getByText(/Shareholding total: 100%/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run it — expect PASS**

Run: `cd frontend && npm test src/components/application/__tests__/owners-step.test.tsx`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/application/OwnersStep.tsx frontend/src/components/application/__tests__/owners-step.test.tsx
git commit -m "feat(web): owners/directors step (multi-owner + shareholding total)"
```

---

### Task 5: Application wizard (7 steps)

**Files:**
- Create: `frontend/src/pages/ApplicationWizardPage.tsx`
- Delete: `frontend/src/pages/FormationWizardPage.tsx` + its test
- Modify: `frontend/src/routes/AppRoutes.tsx` (`/applications/new` in the ProtectedRoute group)
- Test: `frontend/src/pages/__tests__/application-wizard.test.tsx`

**Interfaces:**
- Consumes `apiPost<Application>('/api/applications')`, `apiPatch<Application>('/api/applications/:id', patch)`, `apiUpload('/api/applications/:id/documents', form)`, `apiPost<{url}>('/api/applications/:id/checkout')`, `OwnersStep`, `ENTITY_TYPES`, `ENTITY_PRICE_CENTS`, `VO_PLANS`, `formatPrice`.
- Flow: step1 entity+tier → creates the application (draft). step2 company details (PATCH). step3 owners via OwnersStep (PATCH). step4 virtual office (PATCH). step5 KYC per-owner upload. step6 review + "Pay & submit" (checkout → redirect). Each PATCH also sets `currentStep`.

- [ ] **Step 1: Create `frontend/src/pages/ApplicationWizardPage.tsx`**

```tsx
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
            {owners.map((o) => (
              <div key={o.fullName} className="rounded-xl border border-frost/10 bg-steel/20 p-4">
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
              <p>{app.companyDetails.proposedName}</p>
              <p className="text-sm text-frost/55">{ENTITY_TYPES.find((e) => e.value === app.entityType)?.label} · {app.owners.length} owner(s) · {app.virtualOffice.wanted ? `VO: ${app.virtualOffice.plan}` : 'no virtual office'}</p>
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

- [ ] **Step 2: Route + delete old wizard**

In `AppRoutes.tsx` (ProtectedRoute group): remove the `FormationWizardPage` import + `/formations/new` route; add:
```tsx
import ApplicationWizardPage from '@/pages/ApplicationWizardPage'
<Route path="/applications/new" element={<ApplicationWizardPage />} />
```
Then:
```bash
git rm frontend/src/pages/FormationWizardPage.tsx frontend/src/pages/__tests__/formation-wizard.test.tsx
```

- [ ] **Step 3: Write the failing test `frontend/src/pages/__tests__/application-wizard.test.tsx`**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ApplicationWizardPage from '../ApplicationWizardPage'

afterEach(() => vi.restoreAllMocks())

describe('ApplicationWizardPage', () => {
  it('creates an application and advances to company details', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      _id: 'a1', entityType: 'SARL', packageTier: 'standard', companyDetails: { proposedName: '', city: "N'Djamena" }, owners: [], virtualOffice: { wanted: false }, priceCents: 49900, status: 'draft', paymentStatus: 'unpaid', statusHistory: [], currentStep: 1, createdAt: '',
    }), { status: 201 })))
    render(<MemoryRouter><ApplicationWizardPage /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    expect(await screen.findByText(/company details/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run it — expect PASS**

Run: `cd frontend && npm test src/pages/__tests__/application-wizard.test.tsx`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/ApplicationWizardPage.tsx frontend/src/routes/AppRoutes.tsx frontend/src/pages/__tests__/application-wizard.test.tsx
git rm --cached frontend/src/pages/FormationWizardPage.tsx frontend/src/pages/__tests__/formation-wizard.test.tsx 2>/dev/null || true
git commit -m "feat(web): rich 7-step application wizard"
```

---

### Task 6: Application detail (owners + VO + per-owner docs + timeline)

**Files:**
- Create: `frontend/src/pages/ApplicationDetailPage.tsx`
- Delete: `frontend/src/pages/FormationDetailPage.tsx` + its test
- Modify: `frontend/src/routes/AppRoutes.tsx` (`/applications/:id`)
- Test: `frontend/src/pages/__tests__/application-detail.test.tsx`

**Interfaces:**
- Consumes `apiGet<Application>('/api/applications/:id')`, `apiGet<DocItem[]>('/api/applications/:id/documents')`. Renders header + StatusBadge, company details, **owners table (role + %)**, virtual office, documents grouped, and the status timeline. Has an error state (no perpetual loading).

- [ ] **Step 1: Create `frontend/src/pages/ApplicationDetailPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { ENTITY_TYPES, STATUS_LABEL, formatPrice } from '@/content/formations'
import { apiGet } from '@/lib/api'
import type { Application, DocItem, ApplicationStatus } from '@/types/app'

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const [a, setA] = useState<Application | null>(null)
  const [docs, setDocs] = useState<DocItem[]>([])
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!id) return
    apiGet<Application>(`/api/applications/${id}`).then(setA).catch(() => setFailed(true))
    apiGet<DocItem[]>(`/api/applications/${id}/documents`).then(setDocs).catch(() => setDocs([]))
  }, [id])

  if (failed) return (
    <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">
      Couldn’t load this application. <Link to="/dashboard" className="text-teal-electric">Back to dashboard</Link>
    </div>
  )
  if (!a) return <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">Loading…</div>

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <Link to="/dashboard" className="text-sm text-teal-electric">← Back to dashboard</Link>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-frost">{a.companyDetails.proposedName}</h1>
            <p className="text-sm text-frost/55">{ENTITY_TYPES.find((e) => e.value === a.entityType)?.label} · {formatPrice(a.priceCents)}</p>
          </div>
          <StatusBadge status={a.status} />
        </div>

        <h2 className="mt-8 text-sm uppercase tracking-wider text-frost/50">Company</h2>
        <div className="mt-2 rounded-lg border border-frost/10 bg-steel/20 p-4 text-sm text-frost/80">
          <p>Activity: {a.companyDetails.businessActivity || '—'}</p>
          <p>Capital: {a.companyDetails.shareCapitalFCFA?.toLocaleString() ?? '—'} FCFA</p>
          <p>City: {a.companyDetails.city}</p>
          <p>Virtual office: {a.virtualOffice.wanted ? a.virtualOffice.plan : 'none'}</p>
        </div>

        <h2 className="mt-8 text-sm uppercase tracking-wider text-frost/50">Owners</h2>
        <div className="mt-2 grid gap-2">
          {a.owners.length === 0 && <p className="text-sm text-frost/55">No owners added.</p>}
          {a.owners.map((o, i) => (
            <div key={i} className="flex justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-3 text-sm">
              <span className="text-frost">{o.fullName} <span className="text-frost/50">({o.role})</span></span>
              <span className="text-frost/60">{o.nationality} · {o.ownershipPercent}%{o.isPrimaryContact ? ' · primary' : ''}</span>
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-sm uppercase tracking-wider text-frost/50">Documents</h2>
        <div className="mt-2 grid gap-2">
          {docs.length === 0 && <p className="text-sm text-frost/55">No documents uploaded.</p>}
          {docs.map((d) => (
            <div key={d._id} className="flex justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-3 text-sm">
              <span className="text-frost">{d.ownerName ? `${d.ownerName} — ` : ''}{d.type} ({d.fileName})</span>
              <span className="text-frost/60">{d.status}</span>
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-sm uppercase tracking-wider text-frost/50">Timeline</h2>
        <ol className="mt-2 border-l border-frost/15 pl-5">
          {a.statusHistory.map((h, i) => (
            <li key={i} className="relative pb-5">
              <span className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full bg-teal-electric" />
              <p className="text-frost">{STATUS_LABEL[h.status as ApplicationStatus] ?? h.status}</p>
              {h.note && <p className="text-sm text-frost/55">{h.note}</p>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Route + delete old detail**

In `AppRoutes.tsx` (ProtectedRoute group): remove `FormationDetailPage` import + `/formations/:id`; add:
```tsx
import ApplicationDetailPage from '@/pages/ApplicationDetailPage'
<Route path="/applications/:id" element={<ApplicationDetailPage />} />
```
Then:
```bash
git rm frontend/src/pages/FormationDetailPage.tsx frontend/src/pages/__tests__/formation-detail.test.tsx
```

- [ ] **Step 3: Write the failing test `frontend/src/pages/__tests__/application-detail.test.tsx`**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ApplicationDetailPage from '../ApplicationDetailPage'

afterEach(() => vi.restoreAllMocks())

describe('ApplicationDetailPage', () => {
  it('shows company name, owners and timeline', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('/documents')) return new Response('[]', { status: 200 })
      return new Response(JSON.stringify({
        _id: 'a1', entityType: 'SARL', packageTier: 'standard',
        companyDetails: { proposedName: 'Acme SARL', city: "N'Djamena", businessActivity: 'Trading' },
        owners: [{ fullName: 'Alice', role: 'both', nationality: 'IN', ownershipPercent: 100, isPrimaryContact: true }],
        virtualOffice: { wanted: true, plan: 'basic' }, priceCents: 69900, status: 'in_review', paymentStatus: 'paid',
        statusHistory: [{ status: 'draft', at: '' }, { status: 'paid', at: '' }], currentStep: 7, createdAt: '',
      }), { status: 200 })
    }))
    render(<MemoryRouter initialEntries={['/applications/a1']}><Routes><Route path="/applications/:id" element={<ApplicationDetailPage />} /></Routes></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Acme SARL')).toBeInTheDocument())
    expect(screen.getByText('Alice', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Paid')).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run it — expect PASS**

Run: `cd frontend && npm test src/pages/__tests__/application-detail.test.tsx`

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/ApplicationDetailPage.tsx frontend/src/routes/AppRoutes.tsx frontend/src/pages/__tests__/application-detail.test.tsx
git rm --cached frontend/src/pages/FormationDetailPage.tsx frontend/src/pages/__tests__/formation-detail.test.tsx 2>/dev/null || true
git commit -m "feat(web): application detail (owners, VO, per-owner docs, timeline)"
```

---

### Task 7: Landing Get Started CTA + full green

**Files:**
- Modify: `frontend/src/components/sections/HeroSection.tsx` OR the home CTA section to point "Get Started" → `/get-started` (find the existing primary CTA and set its target).
- Modify: `frontend/src/components/layout/Navbar.tsx` (logged-out "Get Started" → `/get-started`)
- Test: full suite + build

**Interfaces:**
- Consumes existing components; only changes CTA destinations and verifies the whole suite + build.

- [ ] **Step 1: Point the landing + navbar "Get Started" CTAs at `/get-started`**

In `Navbar.tsx`, the logged-out cluster's "Get Started" button currently does `navigate('/contact')` — change both desktop and mobile to `navigate('/get-started')`. In the home hero/CTA section, find the primary call-to-action link/button and set it to `/get-started` (use a `<Link to="/get-started">` around the existing `Button`, matching existing patterns). Leave secondary "Contact" actions unchanged.

- [ ] **Step 2: Run the FULL frontend suite + build**

Run: `cd frontend && npm test && npm run build`
Expected: all tests pass; `tsc + vite build` clean. If any leftover import references a deleted `Formation*` page/test, remove it.

- [ ] **Step 3: Commit**

```bash
git add frontend/src
git commit -m "feat(web): wire Get Started CTAs; phase C green"
```

---

## Self-Review Notes (coverage vs spec §4–§5, §8)

- Application types + content (owners, VO) → Task 1. ✅
- Login-only + Get Started signup (with phone) → Task 2. ✅
- Dashboard on applications → Task 3. ✅
- Owners step (multi-owner + %) → Task 4. ✅
- 7-step wizard (company, owners, VO, KYC, pay) → Task 5. ✅
- Application detail (owners + VO + per-owner docs + timeline) → Task 6. ✅
- Landing/nav Get Started CTA → Task 7. ✅
- Admin (separate login + review) → **Phase D** (separate plan). 
