# Phase 7 — Renewals & Compliance Reminders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expiry tracking, threshold-based renewal reminders, renewal services, and a customer Renew flow.

**Architecture:** `Application` gains `expiresAt`/`remindersSent`/`renewsApplicationId`. Certificate issuance sets `expiresAt`. A `runRenewalReminders` function (admin-triggered, cron-ready) sends one reminder per threshold bucket via `notifyUser`. Renewal services are generic catalog entries; a Renew button creates a linked renewal order.

**Tech Stack:** Express + TS + MongoDB (`backend/`), Vite/React + TS (`frontend/`), Vitest.

## Global Constraints

- Backend under `backend/`, frontend under `frontend/`. TS ESM / TSX.
- Reminder thresholds (days): `[1, 7, 30, 60, 90]`. One reminder per bucket (smallest threshold ≥ days-to-expiry).
- Renewal services: `annual-renewal`, `license-renewal` (generic flow). Expiry term: 365 days from issuance.
- Existing flows unchanged except additive fields + endpoints. Each task ends green and is committed.

---

### Task 1: Model fields + renewal services + expiry on issue + renew link (backend)

**Files:**
- Modify: `backend/src/models/Application.ts` (`expiresAt`, `remindersSent`, `renewsApplicationId`)
- Modify: `backend/src/lib/services.ts` (add 2 renewal services)
- Modify: `backend/src/routes/staff.ts` (issue-certificate sets `expiresAt`)
- Modify: `backend/src/routes/applications.ts` (POST accepts `renewsApplicationId`)
- Test: `backend/src/__tests__/renewal.fields.test.ts`

**Interfaces:**
- `Application` adds `expiresAt: { type: Date, default: null }`, `remindersSent: { type: [Number], default: [] }`, `renewsApplicationId: { type: ObjectId, ref:'Application', default: null }`.
- `SERVICES` gains `annual-renewal` (priceCents 25000) and `license-renewal` (priceCents 20000), both `flow:'generic'`, category `'Compliance'`.
- `POST /api/applications` reads optional `renewsApplicationId` and stores it (formation + generic paths).
- `issue-certificate` sets `app.expiresAt = registeredAt + 365 days`.

- [ ] **Step 1: `Application.ts`** — add after `registeredAt`:
```ts
  expiresAt: { type: Date, default: null },
  remindersSent: { type: [Number], default: [] },
  renewsApplicationId: { type: Schema.Types.ObjectId, ref: 'Application', default: null },
```

- [ ] **Step 2: `services.ts`** — add two entries to the `SERVICES` array:
```ts
  {
    key: 'annual-renewal', category: 'Compliance', name: 'Annual Renewal & Filing',
    blurb: 'Renew your company registration and file annual returns.',
    priceCents: 25000, flow: 'generic',
    intakeFields: [{ name: 'renewingCompany', label: 'Company being renewed', type: 'text', required: true }],
    requiredDocuments: ['other'],
  },
  {
    key: 'license-renewal', category: 'Compliance', name: 'Business License Renewal',
    blurb: 'Renew your Chad business operating license.',
    priceCents: 20000, flow: 'generic',
    intakeFields: [{ name: 'companyName', label: 'Company name', type: 'text', required: true }],
    requiredDocuments: ['other'],
  },
```

- [ ] **Step 3: `staff.ts` issue-certificate** — set expiry. After `app.registeredAt = new Date()`:
```ts
  app.expiresAt = new Date(app.registeredAt.getTime() + 365 * 24 * 60 * 60 * 1000)
```

- [ ] **Step 4: `applications.ts` POST** — accept `renewsApplicationId`. In the POST handler, read it and include it in BOTH the formation and generic `Application.create({...})` calls:
```ts
const { serviceKey = 'company-formation', entityType, packageTier, renewsApplicationId } = req.body ?? {}
// ... include in both create() calls:
  renewsApplicationId: renewsApplicationId ?? null,
```

- [ ] **Step 5: Write the failing test `backend/src/__tests__/renewal.fields.test.ts`**
```ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()
async function authed() {
  await User.create({ email: 'r@x.com', passwordHash: await hashPassword('secret123'), fullName: 'R', country: 'IN', emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'r@x.com', password: 'secret123' })
  return agent
}

describe('renewal fields + services', () => {
  it('exposes renewal services in the catalog', async () => {
    const res = await request(app).get('/api/services')
    const keys = res.body.map((s: { key: string }) => s.key)
    expect(keys).toContain('annual-renewal')
    expect(keys).toContain('license-renewal')
  })
  it('stores renewsApplicationId on a new order', async () => {
    const agent = await authed()
    const orig = await agent.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const renewal = await agent.post('/api/applications').send({ serviceKey: 'annual-renewal', renewsApplicationId: orig.body._id })
    expect(renewal.status).toBe(201)
    expect(String(renewal.body.renewsApplicationId)).toBe(String(orig.body._id))
  })
})
```

- [ ] **Step 6: Run it — expect PASS**

Run: `cd backend && npm test src/__tests__/renewal.fields.test.ts` then `cd backend && npm test && npm run typecheck`

- [ ] **Step 7: Commit**
```bash
git add backend/src/models/Application.ts backend/src/lib/services.ts backend/src/routes/staff.ts backend/src/routes/applications.ts backend/src/__tests__/renewal.fields.test.ts
git commit -m "feat(backend): renewal fields + renewal services + expiry on issue + renew link"
```

---

### Task 2: Renewal reminder engine + admin trigger + seed (backend)

**Files:**
- Create: `backend/src/lib/renewals.ts`
- Modify: `backend/src/routes/admin.ts` (run-renewal-check)
- Modify: `backend/src/seed.ts` (expiring company)
- Test: `backend/src/__tests__/renewals.test.ts`

**Interfaces:**
- `runRenewalReminders(now?: Date): Promise<{ sent: number }>` — for each `registered` app with `expiresAt`, compute `days`; bucket = smallest threshold ≥ days; if bucket exists and not in `remindersSent` and days ≥ 0, `notifyUser` "Renewal due", push bucket, save. Idempotent.
- `POST /api/admin/run-renewal-check` (requireAuth+requireAdmin) → `{ sent }`.

- [ ] **Step 1: Create `backend/src/lib/renewals.ts`**
```ts
import { Application } from '../models/Application.js'
import { notifyUser } from './notify.js'

const THRESHOLDS = [1, 7, 30, 60, 90] // ascending; bucket = smallest threshold >= days

export async function runRenewalReminders(now: Date = new Date()): Promise<{ sent: number }> {
  const apps = await Application.find({ status: 'registered', expiresAt: { $ne: null } })
  let sent = 0
  for (const app of apps) {
    if (!app.expiresAt) continue
    const days = Math.ceil((new Date(app.expiresAt).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    if (days < 0) continue
    const bucket = THRESHOLDS.find((t) => days <= t)
    if (bucket === undefined) continue // more than 90 days out
    if (app.remindersSent.includes(bucket)) continue
    await notifyUser(app.userId, {
      type: 'status', title: 'Renewal due',
      body: `${app.companyDetails?.proposedName ?? 'Your company'} expires in ${days} day(s) — renew now.`,
      link: `/applications/${app._id}`,
    })
    app.remindersSent.push(bucket)
    await app.save()
    sent++
  }
  return { sent }
}
```

- [ ] **Step 2: Add the admin trigger to `backend/src/routes/admin.ts`**

Add import + route:
```ts
import { runRenewalReminders } from '../lib/renewals.js'
// ...
adminRouter.post('/run-renewal-check', async (_req, res) => {
  const result = await runRenewalReminders()
  res.json(result)
})
```

- [ ] **Step 3: Seed an expiring company** in `backend/src/seed.ts` — for the registered app, set `expiresAt` ~30 days out and clear `remindersSent`. Find the registered app and update before/after creating it. Simplest: after the apps are created, add:
```ts
  const regForExpiry = created.find((a) => a.status === 'registered')
  if (regForExpiry) {
    regForExpiry.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    regForExpiry.remindersSent = []
    await regForExpiry.save()
  }
```
(Use `Date.now()` is unavailable in workflow scripts, but this is normal backend runtime code — `Date.now()` is fine in seed.ts.)

- [ ] **Step 4: Write the failing test `backend/src/__tests__/renewals.test.ts`**
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import mongoose from 'mongoose'
import { Application } from '../models/Application.js'
import { Notification } from '../models/Notification.js'
import { __setTransport } from '../lib/email.js'
import { runRenewalReminders } from '../lib/renewals.js'

beforeEach(() => { __setTransport({ sendMail: vi.fn(async () => ({})) }) })

async function makeRegistered(daysToExpiry: number) {
  return Application.create({
    userId: new mongoose.Types.ObjectId(), serviceKey: 'company-formation', serviceName: 'Company Formation',
    entityType: 'SARL', companyDetails: { proposedName: 'Acme SARL' }, priceCents: 49900,
    status: 'registered', expiresAt: new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000),
  })
}

describe('runRenewalReminders', () => {
  it('sends one reminder for a company expiring in 30 days, then nothing on re-run', async () => {
    const app = await makeRegistered(30)
    const r1 = await runRenewalReminders()
    expect(r1.sent).toBe(1)
    expect(await Notification.countDocuments({ userId: app.userId, title: 'Renewal due' })).toBe(1)
    const r2 = await runRenewalReminders()
    expect(r2.sent).toBe(0)
    const fresh = await Application.findById(app._id)
    expect(fresh!.remindersSent).toContain(30)
  })

  it('ignores companies more than 90 days out', async () => {
    await makeRegistered(200)
    const r = await runRenewalReminders()
    expect(r.sent).toBe(0)
  })
})
```

- [ ] **Step 5: Run it + full suite — expect PASS**

Run: `cd backend && npm test src/__tests__/renewals.test.ts` then `cd backend && npm test && npm run typecheck`

- [ ] **Step 6: Commit**
```bash
git add backend/src/lib/renewals.ts backend/src/routes/admin.ts backend/src/seed.ts backend/src/__tests__/renewals.test.ts
git commit -m "feat(backend): renewal reminder engine + admin trigger + expiring seed"
```

---

### Task 3: Customer expiry + Renew + admin trigger button (frontend)

**Files:**
- Modify: `frontend/src/types/app.ts` (`expiresAt?`, `remindersSent?`, `renewsApplicationId?`)
- Modify: `frontend/src/pages/ApplicationDetailPage.tsx` (expiry + Renew button)
- Modify: `frontend/src/pages/DashboardPage.tsx` (expiry on registered cards — optional)
- Modify: `frontend/src/pages/AdminPage.tsx` (Run renewal check button)
- Test: keep suites green; the existing detail test stays valid.

**Interfaces:**
- `Application` type gains `expiresAt?: string | null`, `remindersSent?: number[]`, `renewsApplicationId?: string | null`.
- Detail page: for a `registered` app with `expiresAt`, show "Expires: {date}" and a **Renew** button → `apiPost<Application>('/api/applications', { serviceKey:'annual-renewal', renewsApplicationId: a._id, })`, then `apiPatch` the new order's intake with `{ renewingCompany: a.companyDetails?.proposedName }` is optional; then `navigate('/services/' + order._id)`.
- AdminPage: a **"Run renewal check"** button → `apiPost('/api/admin/run-renewal-check')`, then show an inline "{n} reminders sent" message.

- [ ] **Step 1: `types/app.ts`** — add to `Application`:
```ts
  expiresAt?: string | null
  remindersSent?: number[]
  renewsApplicationId?: string | null
```

- [ ] **Step 2: `ApplicationDetailPage.tsx`** — add a Renew handler + UI. Add imports `apiPost`, `useNavigate`. In the component:
```tsx
const navigate = useNavigate()
async function renew() {
  if (!a) return
  const order = await apiPost<Application>('/api/applications', { serviceKey: 'annual-renewal', renewsApplicationId: a._id })
  navigate(`/services/${order._id}`)
}
```
In the header area, when `a.status === 'registered'`:
```tsx
{a.status === 'registered' && a.expiresAt && (
  <div className="mt-2 flex items-center gap-3">
    <span className="text-sm text-frost/60">Expires: {new Date(a.expiresAt).toISOString().slice(0, 10)}</span>
    <button onClick={renew} className="text-sm text-teal-electric">Renew</button>
  </div>
)}
```

- [ ] **Step 3: `AdminPage.tsx`** — add a renewal-check control. In the component:
```tsx
const [renewalMsg, setRenewalMsg] = useState('')
async function runRenewalCheck() {
  const r = await apiPost<{ sent: number }>('/api/admin/run-renewal-check')
  setRenewalMsg(`${r.sent} renewal reminder(s) sent`)
}
```
(Import `apiPost`.) In the left column header (near "Applications"):
```tsx
<div className="mt-3">
  <Button size="sm" variant="outline" onClick={runRenewalCheck}>Run renewal check</Button>
  {renewalMsg && <span className="ml-2 text-xs text-teal-electric">{renewalMsg}</span>}
</div>
```

- [ ] **Step 4: (optional) Dashboard expiry** — in `DashboardPage.tsx`, append ` · expires {date}` to the registered card sub-line when `a.expiresAt`. Skip if it complicates.

- [ ] **Step 5: Run the affected tests — expect PASS**

Run: `cd frontend && npm test src/pages/__tests__/application-detail.test.tsx src/pages/__tests__/admin.test.tsx`

- [ ] **Step 6: Commit**
```bash
git add frontend/src/types/app.ts frontend/src/pages/ApplicationDetailPage.tsx frontend/src/pages/DashboardPage.tsx frontend/src/pages/AdminPage.tsx
git commit -m "feat(web): company expiry + Renew button + admin renewal check"
```

---

### Task 4: Full green + verification

**Files:**
- Test: full suites + build.

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
git commit -m "chore: phase 7 green"
```

---

## Self-Review Notes (coverage vs design §2–§7)

- expiresAt/remindersSent/renewsApplicationId → Task 1. ✅
- Renewal services in catalog → Task 1. ✅
- Expiry set on issue → Task 1. ✅
- Renew link on create → Task 1. ✅
- Reminder engine (bucketed, idempotent) → Task 2. ✅
- Admin trigger → Task 2. ✅
- Expiring seed → Task 2. ✅
- Customer expiry + Renew → Task 3. ✅
- Admin run-renewal-check button → Task 3. ✅
- Admin-config (services editor) → deferred to Phase 7b (noted). ✅
