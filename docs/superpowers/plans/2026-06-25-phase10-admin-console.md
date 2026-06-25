# Phase 10 — Admin Console + Chad-Only Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chad-only flow + an admin console with stats, user management, and admin-configurable payment methods.

**Architecture:** New admin endpoints (stats, users, role change), a `Settings` singleton for payment methods read by checkout, removal of AE/KE services, removal of the frontend country selector, and admin console panels.

**Tech Stack:** Express + TS + MongoDB (`backend/`), Vite/React + TS (`frontend/`), Vitest.

## Global Constraints

- Backend under `backend/`, frontend under `frontend/`. TS ESM / TSX.
- Payment method keys: `stripe | bank_transfer | flutterwave`. Roles enum unchanged.
- Admin endpoints require `requireAuth + requireAdmin` (router-level). Each task ends green and is committed.

---

### Task 1: Admin stats + user management (backend)

**Files:**
- Modify: `backend/src/routes/admin.ts` (stats, users, role change)
- Test: `backend/src/__tests__/admin.console.test.ts`

**Interfaces:** (requireAdmin via router)
- `GET /api/admin/stats` → `{ applications: { total, byStatus }, revenueCents, users, openTickets }`.
- `GET /api/admin/users` → users list (no passwordHash).
- `PATCH /api/admin/users/:id/role` { role } → change role; reject if target is the caller (self) → 400; `logAudit`.

- [ ] **Step 1: Add to `backend/src/routes/admin.ts`**

Add imports: `import { Invoice } from '../models/Invoice.js'`, `import { Ticket } from '../models/Ticket.js'` (User already imported; logAudit already imported). Add routes:
```ts
adminRouter.get('/stats', async (_req, res) => {
  const byStatusAgg = await Application.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }])
  const byStatus: Record<string, number> = {}
  for (const r of byStatusAgg) byStatus[r._id] = r.n
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0)
  const paidAgg = await Invoice.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, sum: { $sum: '$amountCents' } } }])
  const revenueCents = paidAgg[0]?.sum ?? 0
  const users = await User.countDocuments({})
  const openTickets = await Ticket.countDocuments({ status: 'open' })
  res.json({ applications: { total, byStatus }, revenueCents, users, openTickets })
})

adminRouter.get('/users', async (_req, res) => {
  const users = await User.find({}).select('email fullName role country emailVerified createdAt').sort({ createdAt: -1 })
  res.json(users)
})

const ROLES = ['user', 'customer', 'sales', 'legal', 'compliance', 'government_agent', 'finance', 'support', 'admin']
adminRouter.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body ?? {}
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' })
  if (req.params.id === req.userId) return res.status(400).json({ error: 'Cannot change your own role' })
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('email fullName role')
  if (!user) return res.status(404).json({ error: 'Not found' })
  await logAudit(req, 'user.role', `user:${req.params.id}`, { role })
  res.json(user)
})
```

- [ ] **Step 2: Write the failing test `backend/src/__tests__/admin.console.test.ts`**
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'
import { __setTransport } from '../lib/email.js'

const app = createApp()
beforeEach(() => { __setTransport({ sendMail: vi.fn(async () => ({})) }) })
async function login(role: string, email: string) {
  const u = await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return { agent, id: String(u._id) }
}

describe('admin console', () => {
  it('returns stats', async () => {
    const customer = await login('customer', 'c@x.com')
    await customer.agent.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const admin = await login('admin', 'a@x.com')
    const res = await admin.agent.get('/api/admin/stats')
    expect(res.status).toBe(200)
    expect(res.body.applications.total).toBeGreaterThanOrEqual(1)
    expect(typeof res.body.users).toBe('number')
  })
  it('lists users and changes a role; cannot change own', async () => {
    const target = await login('customer', 't@x.com')
    const admin = await login('admin', 'a2@x.com')
    const list = await admin.agent.get('/api/admin/users')
    expect(list.body.length).toBeGreaterThanOrEqual(2)
    const changed = await admin.agent.patch(`/api/admin/users/${target.id}/role`).send({ role: 'legal' })
    expect(changed.body.role).toBe('legal')
    const self = await admin.agent.patch(`/api/admin/users/${admin.id}/role`).send({ role: 'customer' })
    expect(self.status).toBe(400)
  })
  it('blocks non-admins', async () => {
    const legal = await login('legal', 'l@x.com')
    expect((await legal.agent.get('/api/admin/stats')).status).toBe(403)
  })
})
```

- [ ] **Step 3: Run it — expect PASS**

Run: `cd backend && npm test src/__tests__/admin.console.test.ts` then `cd backend && npm test && npm run typecheck`

- [ ] **Step 4: Commit**
```bash
git add backend/src/routes/admin.ts backend/src/__tests__/admin.console.test.ts
git commit -m "feat(backend): admin stats + user management"
```

---

### Task 2: Payment settings + checkout enforcement + Chad-only (backend)

**Files:**
- Create: `backend/src/models/Settings.ts`
- Create: `backend/src/lib/settings.ts`
- Create: `backend/src/routes/settings.ts`
- Modify: `backend/src/routes/admin.ts` (settings patch)
- Modify: `backend/src/routes/payments.ts` (reject disabled method)
- Modify: `backend/src/app.ts` (mount `/api/settings`)
- Modify: `backend/src/lib/services.ts` (remove AE/KE services)
- Modify: `backend/src/index.ts` + `backend/src/seed.ts` (seed settings)
- Test: `backend/src/__tests__/settings.test.ts`

**Interfaces:**
- `Settings` doc keyed `key: 'payment'`, `value: { stripe, bank_transfer, flutterwave }`.
- `settings.ts`: `getPaymentSettings(): Promise<{stripe,bank_transfer,flutterwave}>` (seeds default if missing); `setPaymentSettings(patch)`.
- `GET /api/settings/payment` (public) → the object. `PATCH /api/admin/settings/payment` (admin) → update + audit.
- Checkout: if the chosen `method` is not enabled → 400.
- `SERVICES` no longer contains `uae-company-formation`/`kenya-company-formation`.

- [ ] **Step 1: Create `backend/src/models/Settings.ts`**
```ts
import mongoose, { Schema, type InferSchemaType } from 'mongoose'
const settingsSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: Schema.Types.Mixed, default: {} },
})
export type ISettings = InferSchemaType<typeof settingsSchema>
export const Settings = mongoose.model('Settings', settingsSchema)
```

- [ ] **Step 2: Create `backend/src/lib/settings.ts`**
```ts
import { Settings } from '../models/Settings.js'

export interface PaymentSettings { stripe: boolean; bank_transfer: boolean; flutterwave: boolean }
const DEFAULT_PAYMENT: PaymentSettings = { stripe: true, bank_transfer: true, flutterwave: false }

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const doc = await Settings.findOne({ key: 'payment' })
  if (!doc) { await Settings.create({ key: 'payment', value: DEFAULT_PAYMENT }); return DEFAULT_PAYMENT }
  return { ...DEFAULT_PAYMENT, ...(doc.value as Partial<PaymentSettings>) }
}

export async function setPaymentSettings(patch: Partial<PaymentSettings>): Promise<PaymentSettings> {
  const current = await getPaymentSettings()
  const next = { ...current, ...patch }
  await Settings.findOneAndUpdate({ key: 'payment' }, { value: next }, { upsert: true })
  return next
}
```

- [ ] **Step 3: Create `backend/src/routes/settings.ts`**
```ts
import { Router } from 'express'
import { getPaymentSettings } from '../lib/settings.js'
export const settingsRouter = Router()
settingsRouter.get('/payment', async (_req, res) => { res.json(await getPaymentSettings()) })
```

- [ ] **Step 4: `admin.ts`** — settings patch (import `setPaymentSettings`):
```ts
adminRouter.patch('/settings/payment', async (req, res) => {
  const patch: Record<string, boolean> = {}
  for (const k of ['stripe', 'bank_transfer', 'flutterwave']) if (typeof req.body?.[k] === 'boolean') patch[k] = req.body[k]
  const next = await setPaymentSettings(patch)
  await logAudit(req, 'settings.payment', 'settings:payment', patch)
  res.json(next)
})
```

- [ ] **Step 5: `payments.ts` checkout** — reject disabled method. Import `getPaymentSettings`; after resolving `method`:
```ts
const settings = await getPaymentSettings()
if (!settings[method]) return res.status(400).json({ error: 'Payment method not available' })
```
(Place after `const method = ...` and before/after the invoice upsert — before creating the Stripe session.)

- [ ] **Step 6: `app.ts`** — mount: `import { settingsRouter } from './routes/settings.js'` + `app.use('/api/settings', settingsRouter)`.

- [ ] **Step 7: `services.ts`** — remove the `uae-company-formation` and `kenya-company-formation` entries from `SERVICES` (Chad-only). Keep `country?` on ServiceDef (harmless).

- [ ] **Step 8: `index.ts` + `seed.ts`** — seed settings: import + call `getPaymentSettings()` (it self-seeds) alongside the other seeds. In `seed.ts` also `await Settings.deleteMany({})` is optional; calling `getPaymentSettings()` after creating ensures the default exists.

- [ ] **Step 9: Write the failing test `backend/src/__tests__/settings.test.ts`**
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'
import { __setStripe } from '../lib/stripe.js'

const app = createApp()
beforeEach(() => {
  __setStripe({ checkout: { sessions: { create: vi.fn(async () => ({ id: 'cs', url: 'https://s.test' })) } }, webhooks: { constructEvent: () => ({ type: 'x', data: { object: {} } }) as never } })
})
async function login(role: string, email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app); await agent.post('/api/auth/login').send({ email, password: 'secret123' }); return agent
}

describe('payment settings', () => {
  it('public default has stripe+bank on, flutterwave off', async () => {
    const res = await request(app).get('/api/settings/payment')
    expect(res.body.stripe).toBe(true); expect(res.body.bank_transfer).toBe(true); expect(res.body.flutterwave).toBe(false)
  })
  it('admin disables bank transfer; checkout then rejects it', async () => {
    const admin = await login('admin', 'a@x.com')
    await admin.patch('/api/admin/settings/payment').send({ bank_transfer: false })
    const customer = await login('customer', 'c@x.com')
    const order = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const res = await customer.post(`/api/applications/${order.body._id}/checkout`).send({ method: 'bank_transfer' })
    expect(res.status).toBe(400)
  })
  it('catalog is Chad-only (no AE/KE services)', async () => {
    const res = await request(app).get('/api/services?country=all')
    const keys = res.body.map((s: { key: string }) => s.key)
    expect(keys).not.toContain('uae-company-formation')
    expect(keys).not.toContain('kenya-company-formation')
  })
})
```

- [ ] **Step 10: Run it + full suite — expect PASS**

Run: `cd backend && npm test src/__tests__/settings.test.ts` then `cd backend && npm test && npm run typecheck`. (The earlier `country.test.ts` asserted AE/KE services exist — UPDATE it: change those assertions to expect they are ABSENT, or remove that test case, since the catalog is now Chad-only. Keep the countries-list + application.country default assertions.)

- [ ] **Step 11: Commit**
```bash
git add backend/src/models/Settings.ts backend/src/lib/settings.ts backend/src/routes/settings.ts backend/src/routes/admin.ts backend/src/routes/payments.ts backend/src/app.ts backend/src/lib/services.ts backend/src/index.ts backend/src/seed.ts backend/src/__tests__/settings.test.ts backend/src/__tests__/country.test.ts
git commit -m "feat(backend): payment settings + checkout enforcement; Chad-only catalog"
```

---

### Task 3: Chad-only frontend + checkout reads enabled methods (frontend)

**Files:**
- Modify: `frontend/src/pages/GetStartedPage.tsx` (remove country selector)
- Modify: `frontend/src/pages/StartServicePage.tsx` (remove country selector)
- Modify: `frontend/src/pages/ApplicationWizardPage.tsx` + `GenericServiceWizardPage.tsx` (read enabled methods)
- Modify: `frontend/src/types/app.ts` (`PaymentSettings`)
- Test: keep get-started test green (drop the country mock if it breaks).

**Interfaces:**
- Remove the country `<select>` and `country`/`countries` state from GetStarted + StartService; call `fetchServices('TD')` (or keep `fetchServices()` default). `GenericServiceWizardPage` keeps `fetchServices('all')`.
- Both wizards fetch `GET /api/settings/payment` and render only the enabled method radios (Stripe / Bank transfer / Flutterwave). If only one is enabled, preselect it.

- [ ] **Step 1: `GetStartedPage.tsx`** — remove the country selector block + `country`/`countries` state + `fetchCountries` import; the services effect becomes `useEffect(() => { fetchServices('TD').then(...) }, [])`.

- [ ] **Step 2: `StartServicePage.tsx`** — same: remove country selector; `useEffect(() => { fetchServices('TD').then(setServices) }, [])`.

- [ ] **Step 3: `types/app.ts`** — add `export interface PaymentSettings { stripe: boolean; bank_transfer: boolean; flutterwave: boolean }`.

- [ ] **Step 4: Both wizards** — fetch settings and gate the method radios. In `ApplicationWizardPage.tsx` and `GenericServiceWizardPage.tsx`, add:
```tsx
import { apiGet } from '@/lib/api' // already imported
import type { PaymentSettings } from '@/types/app'
// state:
const [pm, setPm] = useState<PaymentSettings>({ stripe: true, bank_transfer: true, flutterwave: false })
useEffect(() => { apiGet<PaymentSettings>('/api/settings/payment').then(setPm).catch(() => {}) }, [])
```
In the method selector JSX, wrap each radio with its enabled flag, e.g.:
```tsx
{pm.stripe && (<label …><input type="radio" name="pm" checked={method === 'stripe'} onChange={() => setMethod('stripe')} /> Card (Stripe)</label>)}
{pm.bank_transfer && (<label …><input type="radio" name="pm" checked={method === 'bank_transfer'} onChange={() => setMethod('bank_transfer')} /> Bank transfer</label>)}
{pm.flutterwave && (<label …><input type="radio" name="pm" checked={method === 'flutterwave'} onChange={() => setMethod('flutterwave')} /> Flutterwave</label>)}
```
Remove the old hard-coded "Flutterwave — coming soon" disabled line. If the currently selected `method` becomes disabled, default `method` to the first enabled one (a small effect: `useEffect(() => { if (!pm[method]) setMethod(pm.stripe ? 'stripe' : pm.bank_transfer ? 'bank_transfer' : 'flutterwave') }, [pm])`). (Note: `flutterwave` is not yet a real backend method; if selected, checkout will 400 unless enabled — acceptable for now.)

- [ ] **Step 5: get-started test** — if the test mocked `/api/countries`, it can stay (harmless) or be simplified; ensure it still asserts the services list + signup. Run it.

- [ ] **Step 6: Run affected tests + build**

Run: `cd frontend && npm test src/pages/__tests__/get-started.test.tsx` then `cd frontend && npm test && npm run build`

- [ ] **Step 7: Commit**
```bash
git add frontend/src
git commit -m "feat(web): Chad-only flow (drop country selector); checkout reads enabled methods"
```

---

### Task 4: Admin console panels (frontend)

**Files:**
- Create: `frontend/src/components/staff/StatsPanel.tsx`
- Create: `frontend/src/components/staff/UsersPanel.tsx`
- Create: `frontend/src/components/staff/PaymentSettingsPanel.tsx`
- Modify: `frontend/src/pages/StaffPage.tsx` (admin console layout)
- Modify: `frontend/src/types/app.ts` (`AdminUser`, `AdminStats`)
- Test: `frontend/src/components/staff/__tests__/users-panel.test.tsx`

**Interfaces:**
- `AdminStats { applications: { total: number; byStatus: Record<string, number> }; revenueCents: number; users: number; openTickets: number }`.
- `AdminUser { _id; email; fullName; role; country?; emailVerified: boolean }`.
- `StatsPanel`: fetches `/api/admin/stats`, shows cards (Applications, Revenue, Users, Open tickets).
- `UsersPanel`: fetches `/api/admin/users`, table with a role `<select>` per user → `PATCH /api/admin/users/:id/role`.
- `PaymentSettingsPanel`: fetches `/api/settings/payment`, toggles each method → `PATCH /api/admin/settings/payment`.
- `StaffPage` (admin): render a console — `<StatsPanel/>` header, then existing review panels + `<UsersPanel/>`, `<ServicesPanel/>`, `<PaymentSettingsPanel/>`, tickets, audit — each under a clear section.

- [ ] **Step 1: Create `frontend/src/components/staff/StatsPanel.tsx`**
```tsx
import { useEffect, useState } from 'react'
import { formatPrice } from '@/content/formations'
import { apiGet } from '@/lib/api'
import type { AdminStats } from '@/types/app'

export default function StatsPanel() {
  const [s, setS] = useState<AdminStats | null>(null)
  useEffect(() => { apiGet<AdminStats>('/api/admin/stats').then(setS).catch(() => {}) }, [])
  if (!s) return null
  const card = (label: string, value: string) => (
    <div className="rounded-xl border border-frost/10 bg-steel/20 px-5 py-4">
      <p className="text-2xl font-semibold text-frost">{value}</p>
      <p className="text-sm text-frost/55">{label}</p>
    </div>
  )
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {card('Applications', String(s.applications.total))}
      {card('Revenue', formatPrice(s.revenueCents))}
      {card('Users', String(s.users))}
      {card('Open tickets', String(s.openTickets))}
    </section>
  )
}
```

- [ ] **Step 2: Create `frontend/src/components/staff/UsersPanel.tsx`**
```tsx
import { useCallback, useEffect, useState } from 'react'
import { apiGet, apiPatch } from '@/lib/api'
import type { AdminUser } from '@/types/app'

const ROLES = ['customer', 'sales', 'legal', 'compliance', 'government_agent', 'finance', 'support', 'admin']

export default function UsersPanel() {
  const [items, setItems] = useState<AdminUser[]>([])
  const load = useCallback(() => apiGet<AdminUser[]>('/api/admin/users').then(setItems).catch(() => setItems([])), [])
  useEffect(() => { load() }, [load])
  async function setRole(id: string, role: string) { await apiPatch(`/api/admin/users/${id}/role`, { role }).catch(() => {}); load() }
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-frost">Users</h2>
      <div className="mt-4 grid gap-2">
        {items.map((u) => (
          <div key={u._id} className="flex items-center justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-2 text-sm">
            <div>
              <p className="font-medium text-frost">{u.fullName} <span className="text-frost/50">· {u.email}</span></p>
              <p className="text-frost/55">{u.country ?? '—'}{u.emailVerified ? '' : ' · unverified'}</p>
            </div>
            <select className="rounded-lg border border-frost/15 bg-navy px-3 py-2 text-sm text-frost" value={u.role} onChange={(e) => setRole(u._id, e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `frontend/src/components/staff/PaymentSettingsPanel.tsx`**
```tsx
import { useEffect, useState } from 'react'
import { apiGet, apiPatch } from '@/lib/api'
import type { PaymentSettings } from '@/types/app'

const METHODS: { key: keyof PaymentSettings; label: string }[] = [
  { key: 'stripe', label: 'Card (Stripe)' }, { key: 'bank_transfer', label: 'Bank transfer' }, { key: 'flutterwave', label: 'Flutterwave' },
]

export default function PaymentSettingsPanel() {
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
      <h2 className="text-lg font-semibold text-frost">Payment methods</h2>
      <p className="text-sm text-frost/55">Enabled methods are shown to customers at checkout.</p>
      <div className="mt-3 grid gap-2">
        {METHODS.map((m) => (
          <label key={m.key} className="flex items-center justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-3 text-sm text-frost">
            <span>{m.label}</span>
            <input type="checkbox" checked={pm[m.key]} onChange={() => toggle(m.key)} />
          </label>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: `types/app.ts`** — add:
```ts
export interface AdminStats { applications: { total: number; byStatus: Record<string, number> }; revenueCents: number; users: number; openTickets: number }
export interface AdminUser { _id: string; email: string; fullName: string; role: string; country?: string; emailVerified: boolean }
```

- [ ] **Step 5: `StaffPage.tsx`** — render the console for admin. Import the three panels. For admin, add a stats header at top and the new panels:
```tsx
import StatsPanel from '@/components/staff/StatsPanel'
import UsersPanel from '@/components/staff/UsersPanel'
import PaymentSettingsPanel from '@/components/staff/PaymentSettingsPanel'
// in JSX, near the top (after the heading), for admin:
{role === 'admin' && <div className="mt-6"><StatsPanel /></div>}
// ...existing panels...
{role === 'admin' && <UsersPanel />}
{role === 'admin' && <PaymentSettingsPanel />}
// (ServicesPanel + AuditPanel already render for admin)
```
Update the console heading for admin to "Admin console" when role === 'admin' (it already shows the role).

- [ ] **Step 6: Write the failing test `frontend/src/components/staff/__tests__/users-panel.test.tsx`**
```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UsersPanel from '../UsersPanel'

afterEach(() => vi.restoreAllMocks())

describe('UsersPanel', () => {
  it('lists users and changes a role', async () => {
    const patch = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', vi.fn(async (_url: string, opts?: RequestInit) => {
      if (opts?.method === 'PATCH') return patch()
      return new Response(JSON.stringify([{ _id: 'u1', email: 'c@x.com', fullName: 'C', role: 'customer', country: 'IN', emailVerified: true }]), { status: 200 })
    }))
    render(<UsersPanel />)
    await waitFor(() => expect(screen.getByText(/c@x.com/)).toBeInTheDocument())
    await userEvent.selectOptions(screen.getByRole('combobox'), 'legal')
    expect(patch).toHaveBeenCalled()
  })
})
```

- [ ] **Step 7: Run it + build**

Run: `cd frontend && npm test src/components/staff/__tests__/users-panel.test.tsx` then `cd frontend && npm test && npm run build`

- [ ] **Step 8: Commit**
```bash
git add frontend/src
git commit -m "feat(web): admin console — stats, users, payment settings panels"
```

---

### Task 5: Full green + verification

- [ ] **Step 1: Full gates**

Run:
```bash
cd backend && npm test && npm run typecheck
cd frontend && npm test && npm run build && npm run lint
```
Expected: all pass, typecheck clean, build clean, 0 lint warnings. Fix any breakage minimally.

- [ ] **Step 2: Commit (only if fixes were needed)**
```bash
git add -A
git commit -m "chore: phase 10 green"
```

---

## Self-Review Notes (coverage vs design §1–§5)

- Chad-only: AE/KE removed + country selector removed → Tasks 2, 3. ✅
- Admin stats → Tasks 1, 4. ✅
- User management (list + role change + self-guard) → Tasks 1, 4. ✅
- Payment settings (model, public GET, admin PATCH, checkout enforcement) → Tasks 2, 3, 4. ✅
- Admin console layout → Task 4. ✅
