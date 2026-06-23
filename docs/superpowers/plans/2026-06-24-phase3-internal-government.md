# Phase 3 — Internal Team, Roles & Government Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add staff roles, a granular status pipeline, a `/api/staff` surface, a Legal review panel + Government Agent panel, document rejection-with-reason + customer re-upload, and certificate/receipt uploads.

**Architecture:** Runs after Phase 1. Backend gains role middleware, an assignment + rejection-reason data model, new statuses + document types, and a `/api/staff` router (the existing `/api/admin` stays as the admin superset). Frontend gains a role-aware `/staff` area (Legal + Government Agent panels) reached via the existing `/admin/login`, plus customer-side reject-reason + re-upload.

**Tech Stack:** Express + TS + MongoDB (`backend/`), Vite/React + TS (`frontend/`), Vitest.

## Global Constraints

- Backend under `backend/`, frontend under `frontend/`. TS ESM / TSX.
- Roles (exact): `customer`, `sales`, `legal`, `compliance`, `government_agent`, `finance`, `support`, `admin`; legacy `user` (=customer) and `admin` (=super admin) keep working.
- New statuses (exact additions): `legal_review`, `waiting_government`, `completed`. New document types (exact additions): `certificate`, `government_receipt`, `license`.
- Existing `/api/admin/*` endpoints and the formation flow must keep working.
- Each task ends green and is committed. Backend: `cd backend && npm test`. Frontend: `cd frontend && npm test`.

---

### Task 1: Models + role middleware (backend)

**Files:**
- Modify: `backend/src/models/User.ts` (role enum)
- Modify: `backend/src/models/Application.ts` (assignedAgentId + statuses)
- Modify: `backend/src/models/Document.ts` (rejectionReason + types)
- Create: `backend/src/middleware/roles.ts`
- Test: `backend/src/__tests__/roles.middleware.test.ts`

**Interfaces:**
- `User.role` enum becomes `['user','customer','sales','legal','compliance','government_agent','finance','support','admin']` (default `'customer'`).
- `Application` adds `assignedAgentId: { type: ObjectId, ref:'User', default: null }`; status enum gains `legal_review`, `waiting_government`, `completed`.
- `Document` adds `rejectionReason: { type:String, default:'' }`; type enum gains `certificate`, `government_receipt`, `license`.
- `roles.ts` exports `requireStaff(req,res,next)` (403 unless role ∈ staff set = anything except `customer`/`user`) and `requireRole(...roles)` → middleware (403 unless `req.userRole` ∈ roles, with `admin` always allowed).

- [ ] **Step 1: `backend/src/models/User.ts`** — change the role field:
```ts
  role: { type: String, enum: ['user', 'customer', 'sales', 'legal', 'compliance', 'government_agent', 'finance', 'support', 'admin'], default: 'customer' },
```

- [ ] **Step 2: `backend/src/models/Application.ts`** — add `assignedAgentId` and extend status enum:
```ts
  assignedAgentId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
```
and add `'legal_review', 'waiting_government', 'completed'` to the `status` enum array (keep all existing values).

- [ ] **Step 3: `backend/src/models/Document.ts`** — add `rejectionReason` and extend type enum:
```ts
  rejectionReason: { type: String, default: '' },
```
and change the `type` enum to `['passport', 'address_proof', 'photo', 'other', 'certificate', 'government_receipt', 'license']`.

- [ ] **Step 4: Create `backend/src/middleware/roles.ts`**
```ts
import type { Request, Response, NextFunction } from 'express'

const CUSTOMER_ROLES = new Set(['customer', 'user'])

export function requireStaff(req: Request, res: Response, next: NextFunction): void {
  if (!req.userRole || CUSTOMER_ROLES.has(req.userRole)) {
    res.status(403).json({ error: 'Staff only' })
    return
  }
  next()
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.userRole === 'admin' || (req.userRole && roles.includes(req.userRole))) {
      next()
      return
    }
    res.status(403).json({ error: 'Insufficient role' })
  }
}
```

- [ ] **Step 5: Write the failing test `backend/src/__tests__/roles.middleware.test.ts`**
```ts
import { describe, it, expect } from 'vitest'
import type { Request, Response } from 'express'
import { requireStaff, requireRole } from '../middleware/roles.js'

function mockRes() {
  const res = { statusCode: 0, body: null as unknown } as unknown as Response & { statusCode: number; body: unknown }
  res.status = (c: number) => { res.statusCode = c; return res }
  res.json = (b: unknown) => { res.body = b; return res }
  return res
}

describe('role middleware', () => {
  it('requireStaff blocks customers, allows staff', () => {
    let called = false
    const next = () => { called = true }
    requireStaff({ userRole: 'customer' } as Request, mockRes(), next)
    expect(called).toBe(false)
    called = false
    requireStaff({ userRole: 'legal' } as Request, mockRes(), next)
    expect(called).toBe(true)
  })
  it('requireRole allows matching role and admin, blocks others', () => {
    let called = false
    const next = () => { called = true }
    requireRole('legal')({ userRole: 'legal' } as Request, mockRes(), next); expect(called).toBe(true)
    called = false
    requireRole('legal')({ userRole: 'admin' } as Request, mockRes(), next); expect(called).toBe(true)
    called = false
    requireRole('legal')({ userRole: 'finance' } as Request, mockRes(), next); expect(called).toBe(false)
  })
})
```

- [ ] **Step 6: Run it — expect PASS**

Run: `cd backend && npm test src/__tests__/roles.middleware.test.ts` then `cd backend && npm test && npm run typecheck`

- [ ] **Step 7: Commit**
```bash
git add backend/src/models backend/src/middleware/roles.ts backend/src/__tests__/roles.middleware.test.ts
git commit -m "feat(backend): staff roles, assignment, rejection reason, gov doc types + role middleware"
```

---

### Task 2: Staff routes (`/api/staff`) (backend)

**Files:**
- Create: `backend/src/routes/staff.ts`
- Modify: `backend/src/app.ts` (mount `/api/staff`)
- Test: `backend/src/__tests__/staff.routes.test.ts`

**Interfaces:** all under `requireAuth, requireStaff`:
- `GET /api/staff/applications?status=&assigned=me` — list, populate `userId` (email,fullName) + `assignedAgentId` (fullName); `assigned=me` filters to the caller's id.
- `GET /api/staff/applications/:id` — one, populated; `GET /api/staff/applications/:id/documents`.
- `PATCH /api/staff/applications/:id/status { status, note? }` — sets status via pushStatus (role gate: any staff may advance for the demo).
- `PATCH /api/staff/applications/:id/assign { agentId }` — `requireRole('legal','compliance')`; sets `assignedAgentId`.
- `PATCH /api/staff/documents/:id { status, reason? }` — `approved|rejected`; on reject stores `rejectionReason = reason`.
- `GET /api/staff/agents` — `requireRole('legal','compliance')`; list users with role `government_agent` (id, fullName, email).

- [ ] **Step 1: Create `backend/src/routes/staff.ts`**
```ts
import { Router } from 'express'
import { Application } from '../models/Application.js'
import { DocumentModel } from '../models/Document.js'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { requireStaff, requireRole } from '../middleware/roles.js'
import { pushStatus } from './applications.js'

export const staffRouter = Router()
staffRouter.use(requireAuth, requireStaff)

staffRouter.get('/applications', async (req, res) => {
  const filter: Record<string, unknown> = {}
  if (req.query.status) filter.status = String(req.query.status)
  if (req.query.assigned === 'me') filter.assignedAgentId = req.userId
  const list = await Application.find(filter).sort({ createdAt: -1 })
    .populate('userId', 'email fullName').populate('assignedAgentId', 'fullName email')
  res.json(list)
})

staffRouter.get('/applications/:id', async (req, res) => {
  const app = await Application.findById(req.params.id)
    .populate('userId', 'email fullName').populate('assignedAgentId', 'fullName email')
  if (!app) return res.status(404).json({ error: 'Not found' })
  res.json(app)
})

staffRouter.get('/applications/:id/documents', async (req, res) => {
  const docs = await DocumentModel.find({ applicationId: req.params.id }).sort({ uploadedAt: 1 })
  res.json(docs)
})

staffRouter.patch('/applications/:id/status', async (req, res) => {
  const { status, note } = req.body ?? {}
  if (!status) return res.status(400).json({ error: 'status required' })
  const app = await Application.findById(req.params.id)
  if (!app) return res.status(404).json({ error: 'Not found' })
  pushStatus(app, status, note)
  await app.save()
  res.json(app)
})

staffRouter.patch('/applications/:id/assign', requireRole('legal', 'compliance'), async (req, res) => {
  const { agentId } = req.body ?? {}
  const app = await Application.findByIdAndUpdate(req.params.id, { assignedAgentId: agentId ?? null }, { new: true })
    .populate('assignedAgentId', 'fullName email')
  if (!app) return res.status(404).json({ error: 'Not found' })
  res.json(app)
})

staffRouter.patch('/documents/:id', async (req, res) => {
  const { status, reason } = req.body ?? {}
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' })
  const update: Record<string, unknown> = { status }
  if (status === 'rejected') update.rejectionReason = reason ?? ''
  const doc = await DocumentModel.findByIdAndUpdate(req.params.id, update, { new: true })
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
})

staffRouter.get('/agents', requireRole('legal', 'compliance'), async (_req, res) => {
  const agents = await User.find({ role: 'government_agent' }).select('fullName email')
  res.json(agents)
})
```

- [ ] **Step 2: Mount in `backend/src/app.ts`**
```ts
import { staffRouter } from './routes/staff.js'
// ...
app.use('/api/staff', staffRouter)
```

- [ ] **Step 3: Write the failing test `backend/src/__tests__/staff.routes.test.ts`**
```ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()

async function loginAs(role: string, email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('staff routes', () => {
  it('blocks customers from staff endpoints', async () => {
    const cust = await loginAs('customer', 'c@x.com')
    expect((await cust.get('/api/staff/applications')).status).toBe(403)
  })

  it('legal can list, assign an agent, and reject a doc with a reason', async () => {
    const customer = await loginAs('customer', 'cust@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const id = created.body._id
    const up = await customer.post(`/api/applications/${id}/documents`)
      .field('type', 'passport').field('ownerName', 'A')
      .attach('file', Buffer.from('x'), { filename: 'p.pdf', contentType: 'application/pdf' })

    const agentUser = await User.create({ email: 'ag@x.com', passwordHash: await hashPassword('secret123'), fullName: 'Agent', country: 'IN', role: 'government_agent', emailVerified: true })
    const legal = await loginAs('legal', 'legal@x.com')

    const list = await legal.get('/api/staff/applications')
    expect(list.status).toBe(200)
    expect(list.body.length).toBeGreaterThanOrEqual(1)

    const assigned = await legal.patch(`/api/staff/applications/${id}/assign`).send({ agentId: String(agentUser._id) })
    expect(assigned.status).toBe(200)
    expect(String(assigned.body.assignedAgentId._id ?? assigned.body.assignedAgentId)).toBe(String(agentUser._id))

    const rej = await legal.patch(`/api/staff/documents/${up.body._id}`).send({ status: 'rejected', reason: 'Blurry passport' })
    expect(rej.status).toBe(200)
    expect(rej.body.rejectionReason).toBe('Blurry passport')
  })

  it('agent sees only assigned cases', async () => {
    const customer = await loginAs('customer', 'c2@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'virtual-office' })
    const agentUser = await User.create({ email: 'ag2@x.com', passwordHash: await hashPassword('secret123'), fullName: 'Agent2', country: 'IN', role: 'government_agent', emailVerified: true })
    const legal = await loginAs('legal', 'legal2@x.com')
    await legal.patch(`/api/staff/applications/${created.body._id}/assign`).send({ agentId: String(agentUser._id) })
    const agent = request.agent(app)
    await agent.post('/api/auth/login').send({ email: 'ag2@x.com', password: 'secret123' })
    const mine = await agent.get('/api/staff/applications?assigned=me')
    expect(mine.status).toBe(200)
    expect(mine.body.length).toBe(1)
  })
})
```

- [ ] **Step 4: Run it — expect PASS**

Run: `cd backend && npm test src/__tests__/staff.routes.test.ts`

- [ ] **Step 5: Commit**
```bash
git add backend/src/routes/staff.ts backend/src/app.ts backend/src/__tests__/staff.routes.test.ts
git commit -m "feat(backend): /api/staff routes (list, assign, status, doc reject-reason, agents)"
```

---

### Task 3: Seed staff scenario + full backend green (backend)

**Files:**
- Modify: `backend/src/seed.ts`
- Test: `backend/src/__tests__/seed.test.ts` (extend)

**Interfaces:** seed adds `legal@chad.demo / Legal@123` (role `legal`) and `agent@chad.demo / Agent@123` (role `government_agent`); assigns the `in_review` application to the agent; marks one of its documents `rejected` with a reason; adds a `certificate` document to the `registered` application.

- [ ] **Step 1: Update `backend/src/seed.ts`**

After creating admin + user, create staff:
```ts
  const legal = await User.create({ email: 'legal@chad.demo', passwordHash: await hashPassword('Legal@123'), fullName: 'Legal Officer', country: 'Chad', role: 'legal', emailVerified: true })
  const agent = await User.create({ email: 'agent@chad.demo', passwordHash: await hashPassword('Agent@123'), fullName: 'Gov Agent', country: 'Chad', role: 'government_agent', emailVerified: true })
```
After the formation loop, capture the created apps (change the loop to collect them, e.g. `const created = []` and `created.push(await Application.create({...}))`). Then:
```ts
  const inReview = created.find((a) => a.status === 'in_review')
  if (inReview) { inReview.assignedAgentId = agent._id; await inReview.save() }
  const registered = created.find((a) => a.status === 'registered')
  if (inReview) {
    await DocumentModel.create({ applicationId: inReview._id, userId: user._id, ownerName: 'Amadou Diallo', type: 'passport', fileName: 'passport.pdf', storagePath: 'seed/passport.pdf', status: 'rejected', rejectionReason: 'Please upload a clearer passport scan.' })
  }
  if (registered) {
    await DocumentModel.create({ applicationId: registered._id, userId: user._id, ownerName: '', type: 'certificate', fileName: 'certificate-of-incorporation.pdf', storagePath: 'seed/certificate.pdf', status: 'approved' })
  }
```
Import `DocumentModel` at the top: `import { DocumentModel } from './models/Document.js'`. Reference `legal` in the seed log so it isn't an unused var.

- [ ] **Step 2: Update `backend/src/__tests__/seed.test.ts`** — assert the new staff users exist:
```ts
    expect(await User.countDocuments({ role: 'legal' })).toBe(1)
    expect(await User.countDocuments({ role: 'government_agent' })).toBe(1)
```
(add inside the existing test, after `seedDemo()`).

- [ ] **Step 3: Run the full suite + typecheck — expect ALL green**

Run: `cd backend && npm test && npm run typecheck`

- [ ] **Step 4: Commit**
```bash
git add backend/src/seed.ts backend/src/__tests__/seed.test.ts
git commit -m "feat(backend): seed staff users + assigned case + rejected doc + certificate"
```

---

### Task 4: Frontend types + status labels (frontend)

**Files:**
- Modify: `frontend/src/types/app.ts`
- Modify: `frontend/src/content/formations.ts` (STATUS_LABEL additions)
- Modify: `frontend/src/components/formations/StatusBadge.tsx` (tones for new statuses)
- Test: existing status-badge test stays green.

**Interfaces:**
- `ApplicationStatus` gains `legal_review | waiting_government | completed`. `AuthUser.role` becomes the full union (or `string`). `Application` gains `assignedAgentId?: string | { _id:string; fullName:string; email:string } | null`. `DocItem` gains `rejectionReason?: string`; `DocType` gains `certificate | government_receipt | license`.

- [ ] **Step 1: `frontend/src/types/app.ts`**
- Extend `ApplicationStatus` union with `'legal_review' | 'waiting_government' | 'completed'`.
- Extend `DocType` with `'certificate' | 'government_receipt' | 'license'`.
- `AuthUser.role: 'user' | 'customer' | 'sales' | 'legal' | 'compliance' | 'government_agent' | 'finance' | 'support' | 'admin'`.
- `Application` add `assignedAgentId?: string | { _id: string; fullName: string; email: string } | null`.
- `DocItem` add `rejectionReason?: string`.

- [ ] **Step 2: `frontend/src/content/formations.ts`** — extend `STATUS_LABEL` with the new keys:
```ts
  legal_review: 'Legal Review',
  waiting_government: 'Waiting Government',
  completed: 'Completed',
```
(and confirm the existing keys still read: in_review 'Document Review', filing_submitted 'Government Processing', registered 'Approved'. Update those three label strings to these values.)

- [ ] **Step 3: `frontend/src/components/formations/StatusBadge.tsx`** — add tones for the new statuses in the `TONE` record:
```ts
  legal_review: 'neutral',
  waiting_government: 'neutral',
  completed: 'live',
```
(keep `registered: 'live'`.)

- [ ] **Step 4: Run the status-badge test — expect PASS**

Run: `cd frontend && npm test src/components/formations/__tests__/status-badge.test.tsx`

- [ ] **Step 5: Commit**
```bash
git add frontend/src/types/app.ts frontend/src/content/formations.ts frontend/src/components/formations/StatusBadge.tsx
git commit -m "feat(web): staff roles, new statuses, rejection reason, gov doc types in types"
```

---

### Task 5: Staff auth + `/staff` shell (frontend)

**Files:**
- Modify: `frontend/src/pages/AdminLoginPage.tsx` (route any staff role → `/staff`)
- Create: `frontend/src/components/auth/StaffRoute.tsx`
- Create: `frontend/src/pages/StaffPage.tsx` (shell: renders panels by role)
- Modify: `frontend/src/routes/AppRoutes.tsx` (`/staff` under StaffRoute)
- Test: `frontend/src/pages/__tests__/admin-login.test.tsx` (update: non-staff rejected, staff → /staff)

**Interfaces:**
- `StaffRoute`: renders `<Outlet/>` if `user` and role ≠ `customer`/`user`, else `<Navigate to="/admin/login"/>`.
- `AdminLoginPage`: on login, if role is staff (≠ customer/user) → navigate `/staff`; else show "This account is not staff."
- `StaffPage`: reads `useAuth().user.role`; renders the Legal panel (for `legal`/`compliance`/`admin`) and the Government Agent panel (for `government_agent`/`admin`). (Panels built in Task 6; in this task StaffPage can render placeholders importing the panels once they exist — implement Task 6 first if needed, or stub.)

- [ ] **Step 1: Create `frontend/src/components/auth/StaffRoute.tsx`**
```tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'

const CUSTOMER = new Set(['customer', 'user'])
export default function StaffRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">Loading…</div>
  return user && !CUSTOMER.has(user.role) ? <Outlet /> : <Navigate to="/admin/login" replace />
}
```

- [ ] **Step 2: Update `frontend/src/pages/AdminLoginPage.tsx`** — replace the admin-only check:
```tsx
      const u = await login(email, password)
      if (u.role && !['customer', 'user'].includes(u.role)) navigate('/staff')
      else setError('This account is not staff.')
```

- [ ] **Step 3: Create `frontend/src/pages/StaffPage.tsx`**
```tsx
import { useAuth } from '@/store/AuthContext'
import LegalPanel from '@/components/staff/LegalPanel'
import AgentPanel from '@/components/staff/AgentPanel'

export default function StaffPage() {
  const { user, logout } = useAuth()
  const role = user?.role ?? ''
  const showLegal = ['legal', 'compliance', 'admin'].includes(role)
  const showAgent = ['government_agent', 'admin'].includes(role)
  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex items-center justify-between border-b border-frost/10 pb-5">
          <h1 className="text-2xl font-semibold text-frost">Staff console <span className="text-sm text-frost/50">({role})</span></h1>
          <button onClick={() => logout()} className="text-sm text-frost/70 hover:text-frost">Log out</button>
        </div>
        {showLegal && <LegalPanel />}
        {showAgent && <AgentPanel />}
        {!showLegal && !showAgent && <p className="mt-8 text-frost/55">No panels for your role yet.</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Routes in `frontend/src/routes/AppRoutes.tsx`**
```tsx
import StaffRoute from '@/components/auth/StaffRoute'
import StaffPage from '@/pages/StaffPage'
// inside MainLayout block:
<Route element={<StaffRoute />}>
  <Route path="/staff" element={<StaffPage />} />
</Route>
```

- [ ] **Step 5: Update `frontend/src/pages/__tests__/admin-login.test.tsx`** — the non-admin test now: a `customer` is rejected ("not staff"); add a case where a `legal` role logs in and the component navigates (assert no error shown). Minimal change: keep the rejection test but change the role to `customer` and the expected text to `/not staff/i`.

- [ ] **Step 6: Run it — expect PASS** (panels imported in Step 3 must exist — implement Task 6 before running, or temporarily stub the two panel components as empty default-export divs, then fill in Task 6).

Run: `cd frontend && npm test src/pages/__tests__/admin-login.test.tsx`

- [ ] **Step 7: Commit**
```bash
git add frontend/src/components/auth/StaffRoute.tsx frontend/src/pages/StaffPage.tsx frontend/src/pages/AdminLoginPage.tsx frontend/src/routes/AppRoutes.tsx frontend/src/pages/__tests__/admin-login.test.tsx
git commit -m "feat(web): staff auth routing + /staff shell"
```

---

### Task 6: Legal panel + Government Agent panel (frontend)

**Files:**
- Create: `frontend/src/components/staff/LegalPanel.tsx`
- Create: `frontend/src/components/staff/AgentPanel.tsx`
- Test: `frontend/src/components/staff/__tests__/legal-panel.test.tsx`

**Interfaces:**
- `LegalPanel`: lists `GET /api/staff/applications`; open one → review (company/service + owners + documents). Per document: Approve, or Reject with a **reason prompt** (`PATCH /api/staff/documents/:id { status, reason }`). Assign a government agent (dropdown from `GET /api/staff/agents`, `PATCH /api/staff/applications/:id/assign`). Advance status buttons: `in_review`, `legal_review`, `waiting_government`, `needs_more_docs`, `rejected` (`PATCH /api/staff/applications/:id/status`). Refetch after each action.
- `AgentPanel`: lists `GET /api/staff/applications?assigned=me`; open one → upload `certificate` / `government_receipt` / `license` (existing `POST /api/applications/:id/documents` with the doc type), add a remark (note) and advance `filing_submitted` / `registered` / `completed`.

- [ ] **Step 1: Create `frontend/src/components/staff/LegalPanel.tsx`**
```tsx
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { apiGet, apiPatch } from '@/lib/api'
import type { Application, DocItem } from '@/types/app'

const STATUSES = ['in_review', 'legal_review', 'waiting_government', 'needs_more_docs', 'rejected']
const email = (a: Application) => (typeof a.userId === 'object' && a.userId ? a.userId.email : '—')

export default function LegalPanel() {
  const [items, setItems] = useState<Application[]>([])
  const [sel, setSel] = useState<Application | null>(null)
  const [docs, setDocs] = useState<DocItem[]>([])
  const [agents, setAgents] = useState<{ _id: string; fullName: string }[]>([])

  const load = useCallback(async () => { setItems(await apiGet<Application[]>('/api/staff/applications')) }, [])
  useEffect(() => { load(); apiGet<{ _id: string; fullName: string }[]>('/api/staff/agents').then(setAgents).catch(() => setAgents([])) }, [load])

  const open = useCallback(async (id: string) => {
    setSel(await apiGet<Application>(`/api/staff/applications/${id}`))
    setDocs(await apiGet<DocItem[]>(`/api/staff/applications/${id}/documents`))
  }, [])

  async function advance(status: string) { if (!sel) return; await apiPatch(`/api/staff/applications/${sel._id}/status`, { status }); await open(sel._id); await load() }
  async function reviewDoc(docId: string, status: 'approved' | 'rejected') {
    let reason = ''
    if (status === 'rejected') reason = window.prompt('Rejection reason:') ?? ''
    await apiPatch(`/api/staff/documents/${docId}`, { status, reason })
    if (sel) setDocs(await apiGet<DocItem[]>(`/api/staff/applications/${sel._id}/documents`))
  }
  async function assign(agentId: string) { if (!sel) return; await apiPatch(`/api/staff/applications/${sel._id}/assign`, { agentId }); await open(sel._id); await load() }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-frost">Legal review</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="grid gap-2">
          {items.map((a) => (
            <button key={a._id} onClick={() => open(a._id)} className={`rounded-xl border px-4 py-3 text-left ${sel?._id === a._id ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
              <div className="flex items-center justify-between"><span className="font-medium text-frost">{a.companyDetails?.proposedName || a.serviceName}</span><StatusBadge status={a.status} /></div>
              <span className="text-sm text-frost/55">{a.serviceName} · {email(a)}</span>
            </button>
          ))}
        </div>
        <div>
          {!sel ? <p className="text-frost/55">Select an application.</p> : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between"><h3 className="text-lg font-medium text-frost">{sel.companyDetails?.proposedName || sel.serviceName}</h3><StatusBadge status={sel.status} /></div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">Documents</p>
                {docs.map((d) => (
                  <div key={d._id} className="mt-2 flex items-center justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-2 text-sm">
                    <span className="text-frost">{d.ownerName ? `${d.ownerName} — ` : ''}{d.type} <span className="text-frost/50">{d.status}{d.rejectionReason ? ` (${d.rejectionReason})` : ''}</span></span>
                    <span className="flex gap-3">
                      <a href={`/api/applications/${sel._id}/documents/${d._id}/file`} target="_blank" rel="noreferrer" className="text-teal-electric">View</a>
                      <button className="text-teal-electric" onClick={() => reviewDoc(d._id, 'approved')}>Approve</button>
                      <button className="text-indigo-pulse" onClick={() => reviewDoc(d._id, 'rejected')}>Reject</button>
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">Assign government agent</p>
                <select className="mt-2 rounded-lg border border-frost/15 bg-navy px-3 py-2 text-sm text-frost" defaultValue="" onChange={(e) => e.target.value && assign(e.target.value)}>
                  <option value="">Select agent…</option>
                  {agents.map((ag) => <option key={ag._id} value={ag._id}>{ag.fullName}</option>)}
                </select>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">Advance status</p>
                <div className="mt-2 flex flex-wrap gap-2">{STATUSES.map((s) => <Button key={s} size="sm" variant="outline" onClick={() => advance(s)}>{s}</Button>)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `frontend/src/components/staff/AgentPanel.tsx`**
```tsx
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { apiGet, apiPatch, apiUpload } from '@/lib/api'
import type { Application, DocItem } from '@/types/app'

const STATUSES = ['filing_submitted', 'registered', 'completed']
const GOV_DOCS = ['certificate', 'government_receipt', 'license']

export default function AgentPanel() {
  const [items, setItems] = useState<Application[]>([])
  const [sel, setSel] = useState<Application | null>(null)
  const [docs, setDocs] = useState<DocItem[]>([])

  const load = useCallback(async () => { setItems(await apiGet<Application[]>('/api/staff/applications?assigned=me')) }, [])
  useEffect(() => { load() }, [load])
  const open = useCallback(async (id: string) => {
    setSel(await apiGet<Application>(`/api/staff/applications/${id}`))
    setDocs(await apiGet<DocItem[]>(`/api/staff/applications/${id}/documents`))
  }, [])

  async function advance(status: string) { if (!sel) return; await apiPatch(`/api/staff/applications/${sel._id}/status`, { status }); await open(sel._id); await load() }
  async function upload(type: string, file: File) {
    if (!sel) return
    const form = new FormData(); form.append('type', type); form.append('ownerName', ''); form.append('file', file)
    await apiUpload(`/api/applications/${sel._id}/documents`, form)
    setDocs(await apiGet<DocItem[]>(`/api/staff/applications/${sel._id}/documents`))
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-frost">My assigned cases</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="grid gap-2">
          {items.length === 0 && <p className="text-sm text-frost/55">No cases assigned.</p>}
          {items.map((a) => (
            <button key={a._id} onClick={() => open(a._id)} className={`rounded-xl border px-4 py-3 text-left ${sel?._id === a._id ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
              <div className="flex items-center justify-between"><span className="font-medium text-frost">{a.companyDetails?.proposedName || a.serviceName}</span><StatusBadge status={a.status} /></div>
            </button>
          ))}
        </div>
        <div>
          {!sel ? <p className="text-frost/55">Select a case.</p> : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between"><h3 className="text-lg font-medium text-frost">{sel.companyDetails?.proposedName || sel.serviceName}</h3><StatusBadge status={sel.status} /></div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">Upload official documents</p>
                {GOV_DOCS.map((d) => (
                  <label key={d} className="mt-2 flex flex-col gap-1">
                    <span className="text-sm text-frost/70">{d.replace(/_/g, ' ')}</span>
                    <input type="file" accept="image/*,application/pdf" className="text-sm text-frost/70" onChange={(e) => e.target.files?.[0] && upload(d, e.target.files[0])} />
                  </label>
                ))}
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">Uploaded</p>
                {docs.filter((d) => GOV_DOCS.includes(d.type)).map((d) => (
                  <div key={d._id} className="mt-1 flex justify-between rounded-lg border border-frost/10 bg-steel/20 px-3 py-2 text-sm">
                    <span className="text-frost">{d.type} — {d.fileName}</span>
                    <a href={`/api/applications/${sel._id}/documents/${d._id}/file`} target="_blank" rel="noreferrer" className="text-teal-electric">View</a>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-frost/50">Advance</p>
                <div className="mt-2 flex flex-wrap gap-2">{STATUSES.map((s) => <Button key={s} size="sm" variant="outline" onClick={() => advance(s)}>{s}</Button>)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Write the failing test `frontend/src/components/staff/__tests__/legal-panel.test.tsx`**
```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LegalPanel from '../LegalPanel'

afterEach(() => vi.restoreAllMocks())

const APP = { _id: 'a1', serviceKey: 'company-formation', serviceName: 'Company Formation', companyDetails: { proposedName: 'Acme SARL', city: '' }, owners: [], virtualOffice: { wanted: false }, priceCents: 49900, status: 'in_review', paymentStatus: 'paid', statusHistory: [], currentStep: 7, createdAt: '', userId: { _id: 'u1', email: 'c@x.com', fullName: 'C' } }

describe('LegalPanel', () => {
  it('lists applications and opens a review with documents', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('/agents')) return new Response('[]', { status: 200 })
      if (url.endsWith('/documents')) return new Response(JSON.stringify([{ _id: 'd1', type: 'passport', fileName: 'p.pdf', status: 'pending', uploadedAt: '' }]), { status: 200 })
      if (url.includes('/api/staff/applications/a1')) return new Response(JSON.stringify(APP), { status: 200 })
      if (url.includes('/api/staff/applications')) return new Response(JSON.stringify([APP]), { status: 200 })
      return new Response('[]', { status: 200 })
    }))
    render(<LegalPanel />)
    await waitFor(() => expect(screen.getByText('Acme SARL')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Acme SARL'))
    await waitFor(() => expect(screen.getByText(/passport/i)).toBeInTheDocument())
  })
})
```

- [ ] **Step 4: Run it — expect PASS**

Run: `cd frontend && npm test src/components/staff/__tests__/legal-panel.test.tsx`

- [ ] **Step 5: Commit**
```bash
git add frontend/src/components/staff
git commit -m "feat(web): Legal panel + Government Agent panel"
```

---

### Task 7: Customer-side reject reason + re-upload + certificates; full green (frontend)

**Files:**
- Modify: `frontend/src/pages/ApplicationDetailPage.tsx`
- Modify: `frontend/src/pages/GenericServiceWizardPage.tsx` (no change required; skip if N/A)
- Test: full suites + build.

**Interfaces:**
- On the customer application detail page, each document shows its status and, if rejected, the **rejection reason** + a **re-upload** file input (`POST /api/applications/:id/documents` with the same `type`). Add a "Certificates / official documents" subsection listing documents whose type ∈ {certificate, government_receipt, license} with a View link.

- [ ] **Step 1: Update `frontend/src/pages/ApplicationDetailPage.tsx`**

Add a re-upload handler and reason display in the documents block:
```tsx
import { apiUpload } from '@/lib/api' // add to existing imports
// inside component:
async function reupload(type: string, file: File) {
  if (!id) return
  const form = new FormData(); form.append('type', type); form.append('ownerName', ''); form.append('file', file)
  await apiUpload(`/api/applications/${id}/documents`, form)
  const fresh = await import('@/lib/api').then((m) => m.apiGet<typeof docs>(`/api/applications/${id}/documents`))
  setDocs(fresh)
}
```
In the documents list rows, when `d.status === 'rejected'` show the reason + a small re-upload input:
```tsx
{d.status === 'rejected' && (
  <div className="mt-1 text-xs">
    <span className="text-indigo-pulse">Rejected: {d.rejectionReason || 'please re-upload'}</span>
    <input type="file" accept="image/*,application/pdf" className="ml-2 text-frost/60" onChange={(e) => e.target.files?.[0] && reupload(d.type, e.target.files[0])} />
  </div>
)}
```
Add an official-documents block after the documents list:
```tsx
{docs.some((d) => ['certificate', 'government_receipt', 'license'].includes(d.type)) && (
  <>
    <h2 className="mt-8 text-sm uppercase tracking-wider text-frost/50">Certificates & official documents</h2>
    <div className="mt-2 grid gap-2">
      {docs.filter((d) => ['certificate', 'government_receipt', 'license'].includes(d.type)).map((d) => (
        <div key={d._id} className="flex justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-3 text-sm">
          <span className="text-frost">{d.type.replace(/_/g, ' ')} — {d.fileName}</span>
          <a href={`/api/applications/${id}/documents/${d._id}/file`} target="_blank" rel="noreferrer" className="text-teal-electric">View</a>
        </div>
      ))}
    </div>
  </>
)}
```

- [ ] **Step 2: Full green**

Run:
```bash
cd backend && npm test && npm run typecheck
cd frontend && npm test && npm run build && npm run lint
```
Expected: all pass, typecheck clean, build clean, 0 lint warnings. Fix breakage minimally.

- [ ] **Step 3: Commit**
```bash
git add frontend/src
git commit -m "feat(web): customer reject-reason + re-upload + certificates; phase 3 green"
```

---

## Self-Review Notes (coverage vs design §1–§7)

- Roles + middleware → Task 1. ✅
- Granular statuses + assignment + rejection reason + gov doc types → Tasks 1, 4. ✅
- `/api/staff` (list/assign/status/doc-reject/agents) → Task 2. ✅
- Seed staff scenario → Task 3. ✅
- Staff auth + `/staff` shell → Task 5. ✅
- Legal panel + Government Agent panel → Task 6. ✅
- Customer reject-reason + re-upload + certificates → Task 7. ✅
- `/api/admin/*` + formation flow untouched → additive `/api/staff`. ✅
