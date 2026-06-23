# Phase 1 — Service Catalog + Generalized Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every landing service bookable via a configurable service registry. Orders carry a `serviceKey`; formation keeps its rich wizard, every other service uses a generic intake flow.

**Architecture:** Backend exposes a service registry at `GET /api/services`. `Application` gains `serviceKey`/`serviceName`/`intake` with formation fields made optional. Frontend Get Started becomes a service catalog that routes formation services to the existing wizard and generic services to a new generic wizard.

**Tech Stack:** Express + TS + MongoDB (`backend/`), Vite/React + TS (`frontend/`), Vitest.

## Global Constraints

- Backend under `backend/`, frontend under `frontend/`. TS ESM / TSX.
- Service `flow` values exactly `formation | generic`. Existing formation behavior must not break.
- Generalized orders default `serviceKey='company-formation'`, `serviceName='Company Formation'` for back-compat.
- Each task ends green and is committed. Run backend tests with `cd backend && npm test`, frontend with `cd frontend && npm test`.

---

### Task 1: Service registry + `GET /api/services` (backend)

**Files:**
- Create: `backend/src/lib/services.ts`
- Create: `backend/src/routes/services.ts`
- Modify: `backend/src/app.ts` (mount `/api/services`)
- Test: `backend/src/__tests__/services.routes.test.ts`

**Interfaces:**
- Produces `ServiceField`, `ServiceDef`, `SERVICES: ServiceDef[]`, `getService(key): ServiceDef | undefined`, `priceForOrder(key, opts?): number` from `services.ts`.
- `GET /api/services` → `SERVICES` (public, no auth).

- [ ] **Step 1: Create `backend/src/lib/services.ts`**

```ts
export interface ServiceField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea'
  options?: string[]
  required?: boolean
}
export interface ServiceDef {
  key: string
  category: string
  name: string
  blurb: string
  priceCents: number
  flow: 'formation' | 'generic'
  intakeFields: ServiceField[]
  requiredDocuments: string[]
}

export const SERVICES: ServiceDef[] = [
  {
    key: 'company-formation', category: 'Company Formation', name: 'Company Formation',
    blurb: 'Register an LLC/SARL, SA, Branch, Rep Office, NGO or Partnership in Chad.',
    priceCents: 49900, flow: 'formation', intakeFields: [],
    requiredDocuments: ['passport', 'address_proof', 'photo'],
  },
  {
    key: 'virtual-office', category: 'Office Solutions', name: 'Virtual Office',
    blurb: 'A registered business address with mail handling in N’Djamena.',
    priceCents: 20000, flow: 'generic',
    intakeFields: [
      { name: 'package', label: 'Package', type: 'select', options: ['Basic', 'Standard', 'Premium'], required: true },
      { name: 'companyName', label: 'Company / your name', type: 'text', required: true },
    ],
    requiredDocuments: ['passport', 'address_proof'],
  },
  {
    key: 'business-license', category: 'Corporate Services', name: 'Business License',
    blurb: 'Apply for or renew a Chad business operating license.',
    priceCents: 35000, flow: 'generic',
    intakeFields: [
      { name: 'companyName', label: 'Company name', type: 'text', required: true },
      { name: 'activity', label: 'Business activity', type: 'select', options: ['Trading', 'IT', 'Consulting', 'Import/Export', 'Manufacturing', 'Construction'], required: true },
    ],
    requiredDocuments: ['passport', 'address_proof'],
  },
  {
    key: 'accounting', category: 'Tax & Accounting', name: 'Accounting & Bookkeeping',
    blurb: 'Monthly bookkeeping and financial statements.',
    priceCents: 30000, flow: 'generic',
    intakeFields: [
      { name: 'companyName', label: 'Company name', type: 'text', required: true },
      { name: 'turnoverBand', label: 'Monthly turnover', type: 'select', options: ['< $5k', '$5k–$25k', '$25k–$100k', '> $100k'], required: true },
    ],
    requiredDocuments: ['passport'],
  },
  {
    key: 'tax-registration', category: 'Tax & Accounting', name: 'Tax Registration',
    blurb: 'Register for a Tax ID (NIF) and/or VAT in Chad.',
    priceCents: 25000, flow: 'generic',
    intakeFields: [
      { name: 'companyName', label: 'Company name', type: 'text', required: true },
      { name: 'taxType', label: 'Registration type', type: 'select', options: ['Tax ID (NIF)', 'VAT', 'Both'], required: true },
    ],
    requiredDocuments: ['passport'],
  },
  {
    key: 'trademark', category: 'Corporate Services', name: 'Trademark Registration',
    blurb: 'Protect your brand with a registered trademark.',
    priceCents: 40000, flow: 'generic',
    intakeFields: [
      { name: 'markName', label: 'Trademark / brand name', type: 'text', required: true },
      { name: 'class', label: 'Goods/services description', type: 'textarea', required: true },
    ],
    requiredDocuments: ['passport'],
  },
]

export function getService(key: string): ServiceDef | undefined {
  return SERVICES.find((s) => s.key === key)
}

// Base price for an order's service. Formation pricing (entity/tier/VO) is computed
// separately in the applications route; this returns the registry base.
export function priceForOrder(key: string): number {
  return getService(key)?.priceCents ?? 0
}
```

- [ ] **Step 2: Create `backend/src/routes/services.ts`**

```ts
import { Router } from 'express'
import { SERVICES } from '../lib/services.js'

export const servicesRouter = Router()
servicesRouter.get('/', (_req, res) => {
  res.json(SERVICES)
})
```

- [ ] **Step 3: Mount in `backend/src/app.ts`** (public, before auth-guarded routers)

```ts
import { servicesRouter } from './routes/services.js'
// ...
app.use('/api/services', servicesRouter)
```

- [ ] **Step 4: Write the failing test `backend/src/__tests__/services.routes.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'

describe('GET /api/services', () => {
  it('returns the service catalog without auth', async () => {
    const res = await request(createApp()).get('/api/services')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    const formation = res.body.find((s: { key: string }) => s.key === 'company-formation')
    expect(formation.flow).toBe('formation')
    const vo = res.body.find((s: { key: string }) => s.key === 'virtual-office')
    expect(vo.flow).toBe('generic')
    expect(vo.intakeFields.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 5: Run it — expect PASS**

Run: `cd backend && npm test src/__tests__/services.routes.test.ts`

- [ ] **Step 6: Commit**

```bash
git add backend/src/lib/services.ts backend/src/routes/services.ts backend/src/app.ts backend/src/__tests__/services.routes.test.ts
git commit -m "feat(backend): service registry + GET /api/services"
```

---

### Task 2: Generalize Application (serviceKey/serviceName/intake) + routes + seed

**Files:**
- Modify: `backend/src/models/Application.ts`
- Modify: `backend/src/routes/applications.ts`
- Modify: `backend/src/seed.ts`
- Test: `backend/src/__tests__/applications.routes.test.ts` (extend)

**Interfaces:**
- `Application` adds `serviceKey: string` (default `'company-formation'`), `serviceName: string` (default `'Company Formation'`), `intake: object` (default `{}`). `entityType` becomes optional (still enum-validated when present); `companyDetails.proposedName` no longer globally required (formation sets it).
- `POST /api/applications` accepts `{ serviceKey, entityType?, packageTier? }`:
  - generic service → `priceCents = service.priceCents`, `serviceName = service.name`, `intake = {}`, `companyDetails` omitted.
  - formation service (or no serviceKey) → behaves as today (entityType required, formation pricing).
- `PATCH /api/applications/:id` additionally accepts `{ intake }` (shallow-merged) for generic services.

- [ ] **Step 1: Update `backend/src/models/Application.ts`**

Make `entityType` optional and `companyDetails.proposedName` not required; add the new fields. Change:
```ts
  entityType: { type: String, enum: ['SARL', 'SARL_U', 'SA', 'BRANCH', 'REP_OFFICE'] }, // optional now
  serviceKey: { type: String, required: true, default: 'company-formation' },
  serviceName: { type: String, default: 'Company Formation' },
  intake: { type: Schema.Types.Mixed, default: {} },
```
and in `companyDetails`, change `proposedName` to `{ type: String }` (drop `required: true`). Keep everything else.

- [ ] **Step 2: Update `backend/src/routes/applications.ts` POST + PATCH**

Replace the POST handler and extend PATCH:
```ts
import { getService, priceForOrder } from '../lib/services.js'
// ...
applicationsRouter.post('/', async (req, res) => {
  const { serviceKey = 'company-formation', entityType, packageTier } = req.body ?? {}
  const service = getService(serviceKey)
  if (!service) return res.status(400).json({ error: 'Unknown service' })

  if (service.flow === 'formation') {
    if (!ENTITIES.includes(entityType)) return res.status(400).json({ error: 'Invalid entityType' })
    const tier: Tier = packageTier === 'premium' ? 'premium' : 'standard'
    const app = await Application.create({
      userId: req.userId, serviceKey, serviceName: service.name,
      entityType, packageTier: tier,
      companyDetails: { proposedName: 'Untitled' },
      priceCents: totalPrice(entityType, tier, { wanted: false }),
      statusHistory: [{ status: 'draft', at: new Date() }],
    })
    return res.status(201).json(app)
  }

  // generic service
  const app = await Application.create({
    userId: req.userId, serviceKey, serviceName: service.name,
    priceCents: priceForOrder(serviceKey), intake: {},
    statusHistory: [{ status: 'draft', at: new Date() }],
  })
  res.status(201).json(app)
})
```
In the PATCH handler, after the existing field merges add:
```ts
  if (req.body?.intake && typeof req.body.intake === 'object') app.intake = { ...(app.intake ?? {}), ...req.body.intake }
```
(Leave `recompute()` as-is; it only recomputes formation pricing and reads optional fields safely. For generic services `priceCents` stays the registry value — guard `recompute` to only run for formation: wrap the existing `recompute(app)` call as `if (app.serviceKey === 'company-formation' || app.entityType) recompute(app)`.)

- [ ] **Step 3: Update `backend/src/seed.ts`** — set `serviceKey`/`serviceName` on the seeded formation applications:

In each `Application.create({...})` add:
```ts
      serviceKey: 'company-formation', serviceName: 'Company Formation',
```
and add one generic-service order for variety, e.g. after the loop:
```ts
  await Application.create({
    userId: user._id, serviceKey: 'virtual-office', serviceName: 'Virtual Office',
    priceCents: 20000, intake: { package: 'Standard', companyName: 'Demo User' },
    status: 'in_review', paymentStatus: 'paid', currentStep: 3,
    statusHistory: [{ status: 'in_review', at: new Date() }],
  })
```

- [ ] **Step 4: Extend `backend/src/__tests__/applications.routes.test.ts`** — add tests:

```ts
  it('creates a generic-service order priced from the registry', async () => {
    const agent = await authedAgent()
    const res = await agent.post('/api/applications').send({ serviceKey: 'virtual-office' })
    expect(res.status).toBe(201)
    expect(res.body.serviceKey).toBe('virtual-office')
    expect(res.body.serviceName).toBe('Virtual Office')
    expect(res.body.priceCents).toBe(20000)
  })

  it('saves intake on a generic order', async () => {
    const agent = await authedAgent()
    const created = await agent.post('/api/applications').send({ serviceKey: 'tax-registration' })
    const res = await agent.patch(`/api/applications/${created.body._id}`).send({ intake: { taxType: 'VAT', companyName: 'Acme' }, currentStep: 2 })
    expect(res.status).toBe(200)
    expect(res.body.intake.taxType).toBe('VAT')
    expect(res.body.priceCents).toBe(25000) // unchanged for generic
  })

  it('rejects an unknown service', async () => {
    const agent = await authedAgent()
    const res = await agent.post('/api/applications').send({ serviceKey: 'nope' })
    expect(res.status).toBe(400)
  })
```
(The existing formation create test still posts `{ entityType: 'SARL', packageTier: 'standard' }` with no serviceKey — confirm it still passes because `serviceKey` defaults to `'company-formation'`.)

- [ ] **Step 5: Run the suite — expect PASS**

Run: `cd backend && npm test src/__tests__/applications.routes.test.ts` then `cd backend && npm test && npm run typecheck`
Expected: all pass, typecheck clean.

- [ ] **Step 6: Commit**

```bash
git add backend/src/models/Application.ts backend/src/routes/applications.ts backend/src/seed.ts backend/src/__tests__/applications.routes.test.ts
git commit -m "feat(backend): generalize Application with serviceKey/intake; generic orders"
```

---

### Task 3: Service catalog in Get Started (frontend)

**Files:**
- Create: `frontend/src/lib/services.ts` (types + fetch + fallback)
- Modify: `frontend/src/types/app.ts` (Application gains serviceKey/serviceName/intake)
- Modify: `frontend/src/pages/GetStartedPage.tsx` (service catalog step)
- Test: `frontend/src/pages/__tests__/get-started.test.tsx` (update)

**Interfaces:**
- Produces `ServiceDef`/`ServiceField` types + `fetchServices(): Promise<ServiceDef[]>` (GET /api/services) and `SERVICE_FALLBACK` (small static list for tests/offline) in `frontend/src/lib/services.ts`.
- `Application` type adds `serviceKey: string; serviceName: string; intake?: Record<string, unknown>` and makes `entityType?`, `companyDetails?` optional.
- Get Started step 1 lists services grouped by category; selecting one stores `serviceKey` + `flow`. The existing signup step follows. On success the "check inbox" copy references the chosen service.

- [ ] **Step 1: Create `frontend/src/lib/services.ts`**

```ts
import { apiGet } from '@/lib/api'

export interface ServiceField { name: string; label: string; type: 'text' | 'number' | 'select' | 'textarea'; options?: string[]; required?: boolean }
export interface ServiceDef {
  key: string; category: string; name: string; blurb: string
  priceCents: number; flow: 'formation' | 'generic'
  intakeFields: ServiceField[]; requiredDocuments: string[]
}

export const SERVICE_FALLBACK: ServiceDef[] = [
  { key: 'company-formation', category: 'Company Formation', name: 'Company Formation', blurb: 'Register a company in Chad.', priceCents: 49900, flow: 'formation', intakeFields: [], requiredDocuments: ['passport'] },
  { key: 'virtual-office', category: 'Office Solutions', name: 'Virtual Office', blurb: 'A registered address with mail handling.', priceCents: 20000, flow: 'generic', intakeFields: [{ name: 'package', label: 'Package', type: 'select', options: ['Basic', 'Standard', 'Premium'], required: true }], requiredDocuments: ['passport'] },
]

export function fetchServices(): Promise<ServiceDef[]> {
  return apiGet<ServiceDef[]>('/api/services').catch(() => SERVICE_FALLBACK)
}
```

- [ ] **Step 2: Update `frontend/src/types/app.ts`** — in `Application`, make `entityType?` and `companyDetails?` optional and add:
```ts
  serviceKey: string
  serviceName: string
  intake?: Record<string, unknown>
```

- [ ] **Step 3: Rewrite the Get Started step-1 to a service catalog in `frontend/src/pages/GetStartedPage.tsx`**

Replace the entity-only step 1 with a service catalog grouped by category. Keep step 2 (signup) unchanged. Track the chosen service:
```tsx
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import AuthShell from '@/components/auth/AuthShell'
import { fetchServices, type ServiceDef } from '@/lib/services'
import { formatPrice } from '@/content/formations'
import { apiPost, ApiError } from '@/lib/api'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function GetStartedPage() {
  const [services, setServices] = useState<ServiceDef[]>([])
  const [service, setService] = useState<ServiceDef | null>(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ fullName: '', email: '', country: '', phone: '', password: '' })
  const [done, setDone] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    fetchServices().then((s) => {
      setServices(s)
      const params = new URLSearchParams(window.location.search)
      const pre = params.get('service')
      setService(s.find((x) => x.key === pre) ?? s[0] ?? null)
    })
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setError(''); setBusy(true)
    try { await apiPost('/api/auth/signup', form); setDone(true) }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Signup failed') }
    finally { setBusy(false) }
  }

  if (done) return (
    <AuthShell title="Check your inbox" subtitle={`We sent a verification link to ${form.email}.`}>
      <p className="text-sm text-frost/70">Verify your email, then log in to complete your {service?.name} request.</p>
      <Link to="/login" className="mt-4 inline-block text-teal-electric">Go to login</Link>
    </AuthShell>
  )

  if (step === 1) {
    const cats = Array.from(new Set(services.map((s) => s.category)))
    return (
      <AuthShell title="Start your application" subtitle="Choose a service">
        <div className="flex flex-col gap-5">
          {cats.map((cat) => (
            <div key={cat}>
              <p className="mb-2 text-xs uppercase tracking-wider text-frost/50">{cat}</p>
              <div className="flex flex-col gap-2">
                {services.filter((s) => s.category === cat).map((s) => (
                  <button key={s.key} type="button" onClick={() => setService(s)}
                    className={`rounded-xl border px-4 py-3 text-left ${service?.key === s.key ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-frost">{s.name}</span>
                      <span className="text-sm text-teal-electric">{formatPrice(s.priceCents)}</span>
                    </div>
                    <span className="text-sm text-frost/55">{s.blurb}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button disabled={!service} onClick={() => setStep(2)}>Continue</Button>
          <p className="text-center text-sm text-frost/55">Have an account? <Link to="/login" className="text-teal-electric">Log in</Link></p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create your account" subtitle={`Service: ${service?.name}`}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input className={inputCls} placeholder="Full name" value={form.fullName} onChange={set('fullName')} required />
        <input className={inputCls} type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input className={inputCls} placeholder="Country" value={form.country} onChange={set('country')} required />
        <input className={inputCls} type="tel" placeholder="Phone" value={form.phone} onChange={set('phone')} />
        <input className={inputCls} type="password" placeholder="Password (min 8)" minLength={8} value={form.password} onChange={set('password')} required />
        {error && <p className="text-sm text-indigo-pulse">{error}</p>}
        <Button type="submit" fullWidth disabled={busy}>{busy ? 'Creating…' : 'Create account'}</Button>
        <button type="button" className="text-sm text-frost/55" onClick={() => setStep(1)}>← Back</button>
      </form>
    </AuthShell>
  )
}
```

- [ ] **Step 4: Update `frontend/src/pages/__tests__/get-started.test.tsx`** — the first fetch is now `GET /api/services`; mock it then assert a service renders and signup posts. Full file:

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import GetStartedPage from '../GetStartedPage'

afterEach(() => vi.restoreAllMocks())

describe('GetStartedPage', () => {
  it('lists services then submits signup with phone', async () => {
    const fetchMock = vi.fn(async (url: string, opts?: RequestInit) => {
      if (url.includes('/api/services')) return new Response(JSON.stringify([
        { key: 'company-formation', category: 'Company Formation', name: 'Company Formation', blurb: 'x', priceCents: 49900, flow: 'formation', intakeFields: [], requiredDocuments: [] },
        { key: 'virtual-office', category: 'Office Solutions', name: 'Virtual Office', blurb: 'y', priceCents: 20000, flow: 'generic', intakeFields: [], requiredDocuments: [] },
      ]), { status: 200 })
      if (url.includes('/signup') && opts?.method === 'POST') return new Response('{}', { status: 201 })
      return new Response('{}', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<MemoryRouter><GetStartedPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Virtual Office')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await userEvent.type(screen.getByPlaceholderText('Full name'), 'Jo')
    await userEvent.type(screen.getByPlaceholderText('Email'), 'jo@x.com')
    await userEvent.type(screen.getByPlaceholderText('Country'), 'India')
    await userEvent.type(screen.getByPlaceholderText('Password (min 8)'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/signup', expect.objectContaining({ method: 'POST' }))
    expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run it — expect PASS**

Run: `cd frontend && npm test src/pages/__tests__/get-started.test.tsx`

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/services.ts frontend/src/types/app.ts frontend/src/pages/GetStartedPage.tsx frontend/src/pages/__tests__/get-started.test.tsx
git commit -m "feat(web): service catalog in Get Started"
```

---

### Task 4: Generic service wizard + routing from dashboard (frontend)

**Files:**
- Create: `frontend/src/pages/GenericServiceWizardPage.tsx`
- Create: `frontend/src/pages/StartServicePage.tsx` (chooses service then routes)
- Modify: `frontend/src/routes/AppRoutes.tsx` (`/services/new`, `/services/:id`)
- Modify: `frontend/src/pages/DashboardPage.tsx` ("Start application" → `/services/new`)
- Test: `frontend/src/pages/__tests__/generic-service-wizard.test.tsx`

**Interfaces:**
- `StartServicePage` (ProtectedRoute): fetches services, shows the catalog; choosing a `formation` service navigates to `/applications/new`; a `generic` service creates the order (`POST /api/applications {serviceKey}`) then navigates to `/services/:id` (the generic wizard).
- `GenericServiceWizardPage` (ProtectedRoute, `/services/:id`): loads the order + its service def; step 1 renders `intakeFields` → PATCH intake; step 2 uploads `requiredDocuments`; step 3 review + pay (checkout → redirect). Reuses `apiPatch`, `apiUpload`, `apiPost` checkout, the `!url` guard.

- [ ] **Step 1: Create `frontend/src/pages/StartServicePage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { fetchServices, type ServiceDef } from '@/lib/services'
import { formatPrice } from '@/content/formations'
import { apiPost } from '@/lib/api'
import type { Application } from '@/types/app'

export default function StartServicePage() {
  const navigate = useNavigate()
  const [services, setServices] = useState<ServiceDef[]>([])
  const [busy, setBusy] = useState(false)
  useEffect(() => { fetchServices().then(setServices) }, [])

  async function choose(s: ServiceDef) {
    if (s.flow === 'formation') { navigate('/applications/new'); return }
    setBusy(true)
    try {
      const order = await apiPost<Application>('/api/applications', { serviceKey: s.key })
      navigate(`/services/${order._id}`)
    } finally { setBusy(false) }
  }

  const cats = Array.from(new Set(services.map((s) => s.category)))
  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-2xl font-semibold text-frost">Start a new application</h1>
        {cats.map((cat) => (
          <div key={cat} className="mt-6">
            <p className="mb-2 text-xs uppercase tracking-wider text-frost/50">{cat}</p>
            <div className="grid gap-2">
              {services.filter((s) => s.category === cat).map((s) => (
                <button key={s.key} type="button" disabled={busy} onClick={() => choose(s)}
                  className="flex items-center justify-between rounded-xl border border-frost/10 bg-steel/20 px-5 py-4 text-left hover:border-teal-electric/30">
                  <span><span className="font-medium text-frost">{s.name}</span><span className="block text-sm text-frost/55">{s.blurb}</span></span>
                  <span className="text-sm text-teal-electric">{formatPrice(s.priceCents)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `frontend/src/pages/GenericServiceWizardPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/content/formations'
import { fetchServices, type ServiceDef } from '@/lib/services'
import { apiGet, apiPatch, apiUpload, apiPost, ApiError } from '@/lib/api'
import type { Application } from '@/types/app'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function GenericServiceWizardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Application | null>(null)
  const [service, setService] = useState<ServiceDef | null>(null)
  const [intake, setIntake] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    apiGet<Application>(`/api/applications/${id}`).then(async (o) => {
      setOrder(o)
      setIntake((o.intake as Record<string, string>) ?? {})
      const svcs = await fetchServices()
      setService(svcs.find((s) => s.key === o.serviceKey) ?? null)
    }).catch(() => setError('Could not load'))
  }, [id])

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
    try { const { url } = await apiPost<{ url: string }>(`/api/applications/${order._id}/checkout`); if (!url) { setError('Checkout unavailable'); setBusy(false); return } window.location.href = url }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Checkout failed'); setBusy(false) }
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
                <span className="text-sm text-frost/70">{d.replace('_', ' ')}</span>
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
            <Button disabled={busy} onClick={pay}>{busy ? 'Redirecting…' : 'Pay & submit'}</Button>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Save & finish later</Button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Routes + dashboard CTA**

In `AppRoutes.tsx` ProtectedRoute group add:
```tsx
import StartServicePage from '@/pages/StartServicePage'
import GenericServiceWizardPage from '@/pages/GenericServiceWizardPage'
<Route path="/services/new" element={<StartServicePage />} />
<Route path="/services/:id" element={<GenericServiceWizardPage />} />
```
In `DashboardPage.tsx`, change the two `to="/applications/new"` links to `to="/services/new"` (so users start by picking a service).

- [ ] **Step 4: Write the failing test `frontend/src/pages/__tests__/generic-service-wizard.test.tsx`**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import GenericServiceWizardPage from '../GenericServiceWizardPage'

afterEach(() => vi.restoreAllMocks())

describe('GenericServiceWizardPage', () => {
  it('renders intake fields and saves them', async () => {
    const order = { _id: 'o1', serviceKey: 'tax-registration', serviceName: 'Tax Registration', priceCents: 25000, status: 'draft', paymentStatus: 'unpaid', statusHistory: [], currentStep: 1, createdAt: '', owners: [], virtualOffice: { wanted: false }, companyDetails: { city: '' }, intake: {} }
    vi.stubGlobal('fetch', vi.fn(async (url: string, opts?: RequestInit) => {
      if (url.includes('/api/services')) return new Response(JSON.stringify([{ key: 'tax-registration', category: 'Tax & Accounting', name: 'Tax Registration', blurb: 'x', priceCents: 25000, flow: 'generic', intakeFields: [{ name: 'taxType', label: 'Registration type', type: 'select', options: ['VAT'], required: true }], requiredDocuments: ['passport'] }]), { status: 200 })
      if (opts?.method === 'PATCH') return new Response(JSON.stringify({ ...order, intake: { taxType: 'VAT' }, currentStep: 2 }), { status: 200 })
      return new Response(JSON.stringify(order), { status: 200 })
    }))
    render(<MemoryRouter initialEntries={['/services/o1']}><Routes><Route path="/services/:id" element={<GenericServiceWizardPage />} /></Routes></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Registration type')).toBeInTheDocument())
    await userEvent.selectOptions(screen.getByRole('combobox'), 'VAT')
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await waitFor(() => expect(screen.getByText(/upload documents/i)).toBeInTheDocument())
  })
})
```

- [ ] **Step 5: Run it — expect PASS**

Run: `cd frontend && npm test src/pages/__tests__/generic-service-wizard.test.tsx`

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/StartServicePage.tsx frontend/src/pages/GenericServiceWizardPage.tsx frontend/src/routes/AppRoutes.tsx frontend/src/pages/DashboardPage.tsx frontend/src/pages/__tests__/generic-service-wizard.test.tsx
git commit -m "feat(web): generic service wizard + service-first start flow"
```

---

### Task 5: serviceName everywhere + landing links + full green

**Files:**
- Modify: `frontend/src/pages/DashboardPage.tsx` (show serviceName)
- Modify: `frontend/src/pages/ApplicationDetailPage.tsx` (header serviceName; show generic intake)
- Modify: `frontend/src/pages/AdminPage.tsx` (show serviceName in list + detail)
- Modify: `frontend/src/components/layout/Navbar.tsx` mega-menu / landing service cards → `/get-started?service=<key>` (best-effort: point the existing service links to Get Started with the service param where a key is available; otherwise leave marketing links)
- Test: full suites + build

**Interfaces:**
- Display-only changes + final verification.

- [ ] **Step 1: Dashboard — show serviceName**

In `DashboardPage.tsx`, in each order card add the service name. Change the sub-line to:
```tsx
<p className="text-sm text-frost/55">{a.serviceName ?? 'Service'} · {formatPrice(a.priceCents)}</p>
```
(Keep `companyDetails?.proposedName || a.serviceName` as the card title so formation shows the company name and generic services show the service name.)

- [ ] **Step 2: Application detail — header + generic intake**

In `ApplicationDetailPage.tsx`, show `a.serviceName` under the title, and when `a.owners?.length` is 0 and `a.intake` exists, render an "Application details" block listing `Object.entries(a.intake)`:
```tsx
{a.intake && Object.keys(a.intake).length > 0 && (
  <>
    <h2 className="mt-8 text-sm uppercase tracking-wider text-frost/50">Details</h2>
    <div className="mt-2 rounded-lg border border-frost/10 bg-steel/20 p-4 text-sm text-frost/80">
      {Object.entries(a.intake).map(([k, v]) => <p key={k}>{k}: {String(v)}</p>)}
    </div>
  </>
)}
```
Guard the formation-only blocks (owners/company) so they don't crash for generic orders: wrap the company block with `{a.companyDetails?.proposedName && (...)}` and owners with `{a.owners && a.owners.length > 0 && (...)}` (the title can fall back to `a.serviceName`).

- [ ] **Step 3: Admin — show serviceName**

In `AdminPage.tsx`, in the left list line and the right-pane header, include `a.serviceName` (e.g., replace `entityLabel(a.entityType)` with `a.serviceName ?? entityLabel(a.entityType ?? '')`). In the detail pane, guard the owners/company blocks for generic orders and render the `intake` map when present (same pattern as detail).

- [ ] **Step 4: Landing service links → Get Started**

In `Navbar.tsx` mega-menu, where service items currently link to marketing pages, keep them, but ensure the primary "Get Started" CTA points to `/get-started`. (Already done in V2. No required change unless a service item should deep-link; optional: point `company-incorporation` / `virtual-offices` category CTAs to `/get-started?service=company-formation` / `?service=virtual-office`.)

- [ ] **Step 5: Full green**

Run:
```bash
cd backend && npm test && npm run typecheck
cd frontend && npm test && npm run build && npm run lint
```
Expected: all pass, typecheck clean, build clean, 0 lint warnings. Fix any breakage minimally (especially the formation-detail/admin guards for optional fields).

- [ ] **Step 6: Commit**

```bash
git add frontend/src
git commit -m "feat(web): show serviceName across dashboard/detail/admin; phase 1 green"
```

---

## Self-Review Notes (coverage vs design §3–§7)

- Service registry + GET /api/services → Task 1. ✅
- Generalized Application (serviceKey/serviceName/intake), generic create + intake PATCH, seed → Task 2. ✅
- Get Started service catalog → Task 3. ✅
- Generic service wizard + service-first start → Task 4. ✅
- serviceName across dashboard/detail/admin + landing links → Task 5. ✅
- Formation flow untouched (defaults serviceKey) → Tasks 2–5 guards. ✅
