# Phase 8 — Support Tickets & Audit Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Threaded support tickets (customer ↔ staff) and an append-only audit log of key actions, viewable by admin.

**Architecture:** A `Ticket` collection with customer + staff routes; a `AuditLog` collection with a best-effort `logAudit(req,…)` helper wired into key mutations; admin audit view. Frontend adds a customer Support page, a staff Tickets panel, and an admin Audit view inside `/staff`.

**Tech Stack:** Express + TS + MongoDB (`backend/`), Vite/React + TS (`frontend/`), Vitest.

## Global Constraints

- Backend under `backend/`, frontend under `frontend/`. TS ESM / TSX.
- Ticket categories: `legal | payment | documents | technical | other`. Ticket status: `open | closed`.
- Audit is append-only and best-effort (never throws / never blocks the request).
- Existing flows unchanged except additive routes + audit calls. Each task ends green and is committed.

---

### Task 1: Ticket model + customer & staff ticket routes (backend)

**Files:**
- Create: `backend/src/models/Ticket.ts`
- Create: `backend/src/routes/tickets.ts`
- Modify: `backend/src/routes/staff.ts` (staff ticket routes)
- Modify: `backend/src/app.ts` (mount `/api/tickets`)
- Test: `backend/src/__tests__/tickets.test.ts`

**Interfaces:**
- `Ticket`: `userId`, `category`, `subject`, `status` (default open), `messages: [{ authorId, authorRole, body, at }]`, `createdAt`, `updatedAt`.
- Customer routes (`/api/tickets`, requireAuth, scoped): `POST /` {category,subject,body}; `GET /`; `GET /:id`; `POST /:id/messages` {body}.
- Staff routes (in staff.ts): `GET /api/staff/tickets?status=`; `GET /api/staff/tickets/:id`; `POST /api/staff/tickets/:id/messages` {body} → notifyUser; `PATCH /api/staff/tickets/:id` {status}.

- [ ] **Step 1: Create `backend/src/models/Ticket.ts`**
```ts
import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const messageSchema = new Schema(
  { authorId: { type: Schema.Types.ObjectId, ref: 'User' }, authorRole: { type: String, default: '' }, body: { type: String, required: true }, at: { type: Date, default: () => new Date() } },
  { _id: false },
)

const ticketSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, enum: ['legal', 'payment', 'documents', 'technical', 'other'], default: 'other' },
  subject: { type: String, required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  messages: { type: [messageSchema], default: [] },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
})

export type ITicket = InferSchemaType<typeof ticketSchema>
export const Ticket = mongoose.model('Ticket', ticketSchema)
```

- [ ] **Step 2: Create `backend/src/routes/tickets.ts`**
```ts
import { Router } from 'express'
import { Ticket } from '../models/Ticket.js'
import { requireAuth } from '../middleware/auth.js'

export const ticketsRouter = Router()
ticketsRouter.use(requireAuth)

ticketsRouter.post('/', async (req, res) => {
  const { category, subject, body } = req.body ?? {}
  if (!subject || !body) return res.status(400).json({ error: 'subject and body required' })
  const ticket = await Ticket.create({
    userId: req.userId,
    category: ['legal', 'payment', 'documents', 'technical', 'other'].includes(category) ? category : 'other',
    subject,
    messages: [{ authorId: req.userId, authorRole: req.userRole ?? 'customer', body, at: new Date() }],
  })
  res.status(201).json(ticket)
})

ticketsRouter.get('/', async (req, res) => {
  res.json(await Ticket.find({ userId: req.userId }).sort({ updatedAt: -1 }))
})

ticketsRouter.get('/:id', async (req, res) => {
  const t = await Ticket.findOne({ _id: req.params.id, userId: req.userId })
  if (!t) return res.status(404).json({ error: 'Not found' })
  res.json(t)
})

ticketsRouter.post('/:id/messages', async (req, res) => {
  const { body } = req.body ?? {}
  if (!body) return res.status(400).json({ error: 'body required' })
  const t = await Ticket.findOne({ _id: req.params.id, userId: req.userId })
  if (!t) return res.status(404).json({ error: 'Not found' })
  t.messages.push({ authorId: req.userId as never, authorRole: req.userRole ?? 'customer', body, at: new Date() })
  t.status = 'open'
  t.updatedAt = new Date()
  await t.save()
  res.json(t)
})
```

- [ ] **Step 3: Add staff ticket routes to `backend/src/routes/staff.ts`**

Add import `import { Ticket } from '../models/Ticket.js'` and routes:
```ts
staffRouter.get('/tickets', async (req, res) => {
  const filter = req.query.status ? { status: String(req.query.status) } : {}
  res.json(await Ticket.find(filter).sort({ updatedAt: -1 }).populate('userId', 'email fullName'))
})
staffRouter.get('/tickets/:id', async (req, res) => {
  const t = await Ticket.findById(req.params.id).populate('userId', 'email fullName')
  if (!t) return res.status(404).json({ error: 'Not found' })
  res.json(t)
})
staffRouter.post('/tickets/:id/messages', async (req, res) => {
  const { body } = req.body ?? {}
  if (!body) return res.status(400).json({ error: 'body required' })
  const t = await Ticket.findById(req.params.id)
  if (!t) return res.status(404).json({ error: 'Not found' })
  t.messages.push({ authorId: req.userId as never, authorRole: req.userRole ?? 'staff', body, at: new Date() })
  t.updatedAt = new Date()
  await t.save()
  await notifyUser(t.userId, { type: 'info', title: 'Support replied', body: `Re: ${t.subject}`, link: '/support' })
  res.json(t)
})
staffRouter.patch('/tickets/:id', async (req, res) => {
  const { status } = req.body ?? {}
  if (!['open', 'closed'].includes(status)) return res.status(400).json({ error: 'Invalid status' })
  const t = await Ticket.findByIdAndUpdate(req.params.id, { status, updatedAt: new Date() }, { new: true })
  if (!t) return res.status(404).json({ error: 'Not found' })
  res.json(t)
})
```
(`notifyUser` is already imported in staff.ts.)

- [ ] **Step 4: Mount in `backend/src/app.ts`**
```ts
import { ticketsRouter } from './routes/tickets.js'
// ...
app.use('/api/tickets', ticketsRouter)
```

- [ ] **Step 5: Write the failing test `backend/src/__tests__/tickets.test.ts`**
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
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('support tickets', () => {
  it('customer creates a ticket; staff replies; thread grows', async () => {
    const customer = await login('customer', 'c@x.com')
    const created = await customer.post('/api/tickets').send({ category: 'documents', subject: 'Help', body: 'My passport upload failed' })
    expect(created.status).toBe(201)
    expect(created.body.messages.length).toBe(1)

    const support = await login('support', 's@x.com')
    const list = await support.get('/api/staff/tickets')
    expect(list.body.length).toBe(1)
    const reply = await support.post(`/api/staff/tickets/${created.body._id}/messages`).send({ body: 'Please try a PDF.' })
    expect(reply.body.messages.length).toBe(2)
    const closed = await support.patch(`/api/staff/tickets/${created.body._id}`).send({ status: 'closed' })
    expect(closed.body.status).toBe('closed')
  })

  it('a customer cannot read another customer ticket', async () => {
    const a = await login('customer', 'a@x.com')
    const t = await a.post('/api/tickets').send({ category: 'other', subject: 'x', body: 'y' })
    const b = await login('customer', 'b@x.com')
    expect((await b.get(`/api/tickets/${t.body._id}`)).status).toBe(404)
  })
})
```

- [ ] **Step 6: Run it — expect PASS**

Run: `cd backend && npm test src/__tests__/tickets.test.ts` then `cd backend && npm test && npm run typecheck`

- [ ] **Step 7: Commit**
```bash
git add backend/src/models/Ticket.ts backend/src/routes/tickets.ts backend/src/routes/staff.ts backend/src/app.ts backend/src/__tests__/tickets.test.ts
git commit -m "feat(backend): support tickets (customer + staff threaded)"
```

---

### Task 2: Audit log model + helper + wiring + admin view + seed (backend)

**Files:**
- Create: `backend/src/models/AuditLog.ts`
- Create: `backend/src/lib/audit.ts`
- Modify: `backend/src/routes/staff.ts` (logAudit on status/doc/assign/cert/confirm/ticket)
- Modify: `backend/src/routes/admin.ts` (logAudit on admin status; GET /audit)
- Modify: `backend/src/seed.ts` (seed a ticket + a couple audit entries)
- Test: `backend/src/__tests__/audit.test.ts`

**Interfaces:**
- `AuditLog`: `actorId`, `actorRole`, `action`, `target`, `meta` (Mixed), `ip`, `at`.
- `logAudit(req, action, target, meta?): Promise<void>` — best-effort insert (try/catch); reads `req.userId`, `req.userRole`, `req.ip`.
- `GET /api/admin/audit?limit=` (requireAdmin) → recent entries (cap 100), actorId populated email.

- [ ] **Step 1: Create `backend/src/models/AuditLog.ts`**
```ts
import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const auditSchema = new Schema({
  actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  actorRole: { type: String, default: '' },
  action: { type: String, required: true },
  target: { type: String, default: '' },
  meta: { type: Schema.Types.Mixed, default: {} },
  ip: { type: String, default: '' },
  at: { type: Date, default: () => new Date() },
})

export type IAuditLog = InferSchemaType<typeof auditSchema>
export const AuditLog = mongoose.model('AuditLog', auditSchema)
```

- [ ] **Step 2: Create `backend/src/lib/audit.ts`**
```ts
import type { Request } from 'express'
import { AuditLog } from '../models/AuditLog.js'

export async function logAudit(req: Request, action: string, target: string, meta: Record<string, unknown> = {}): Promise<void> {
  try {
    await AuditLog.create({ actorId: req.userId ?? null, actorRole: req.userRole ?? '', action, target, meta, ip: req.ip ?? '' })
  } catch (err) {
    console.warn('logAudit failed (ignored):', (err as Error).message)
  }
}
```

- [ ] **Step 3: Wire `logAudit` into `backend/src/routes/staff.ts`**

Add import `import { logAudit } from '../lib/audit.js'`. Add calls after the relevant `await save()`/update in each handler:
- status patch: `await logAudit(req, 'application.status', \`application:${app._id}\`, { to: status })`
- assign: `await logAudit(req, 'application.assign', \`application:${req.params.id}\`, { agentId })`
- documents patch: `await logAudit(req, 'document.review', \`document:${req.params.id}\`, { status, reason })`
- issue-certificate: `await logAudit(req, 'certificate.issue', \`application:${app._id}\`, { regNo: app.companyRegNo })`
- confirm-payment: `await logAudit(req, 'payment.confirm', \`application:${app._id}\`, {})`
- ticket message: `await logAudit(req, 'ticket.reply', \`ticket:${req.params.id}\`, {})`
- ticket status: `await logAudit(req, 'ticket.status', \`ticket:${req.params.id}\`, { status })`

- [ ] **Step 4: `backend/src/routes/admin.ts`** — add audit on admin status patch + the audit list route:
```ts
import { logAudit } from '../lib/audit.js'
import { AuditLog } from '../models/AuditLog.js'
// in PATCH /applications/:id/status, after save:
await logAudit(req, 'application.status', `application:${req.params.id}`, { to: status })
// new route:
adminRouter.get('/audit', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 100)
  const list = await AuditLog.find({}).sort({ at: -1 }).limit(limit).populate('actorId', 'email fullName')
  res.json(list)
})
```

- [ ] **Step 5: Seed** in `backend/src/seed.ts` — import `Ticket`, `AuditLog`; after apps:
```ts
import { Ticket } from './models/Ticket.js'
import { AuditLog } from './models/AuditLog.js'
// ...
await Ticket.deleteMany({}); await AuditLog.deleteMany({})
await Ticket.create({ userId: user._id, category: 'documents', subject: 'Passport upload issue', status: 'open', messages: [{ authorId: user._id, authorRole: 'customer', body: 'My passport upload keeps failing.', at: new Date() }] })
await AuditLog.create({ actorId: admin._id, actorRole: 'admin', action: 'seed.init', target: 'system', meta: {}, ip: '127.0.0.1' })
```

- [ ] **Step 6: Write the failing test `backend/src/__tests__/audit.test.ts`**
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { Application } from '../models/Application.js'
import { hashPassword } from '../lib/auth.js'
import { __setTransport } from '../lib/email.js'
import { AuditLog } from '../models/AuditLog.js'

const app = createApp()
beforeEach(() => { __setTransport({ sendMail: vi.fn(async () => ({})) }) })
async function login(role: string, email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('audit log', () => {
  it('records a staff status change and admin can read the audit', async () => {
    const customer = await login('customer', 'c@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const legal = await login('legal', 'l@x.com')
    await legal.patch(`/api/staff/applications/${created.body._id}/status`).send({ status: 'in_review' })
    expect(await AuditLog.countDocuments({ action: 'application.status' })).toBeGreaterThanOrEqual(1)

    const admin = await login('admin', 'a@x.com')
    const audit = await admin.get('/api/admin/audit')
    expect(audit.status).toBe(200)
    expect(audit.body.length).toBeGreaterThanOrEqual(1)
    // non-admin blocked
    expect((await legal.get('/api/admin/audit')).status).toBe(403)
  })
})
```

- [ ] **Step 7: Run it + full suite — expect PASS**

Run: `cd backend && npm test src/__tests__/audit.test.ts` then `cd backend && npm test && npm run typecheck`

- [ ] **Step 8: Commit**
```bash
git add backend/src/models/AuditLog.ts backend/src/lib/audit.ts backend/src/routes/staff.ts backend/src/routes/admin.ts backend/src/seed.ts backend/src/__tests__/audit.test.ts
git commit -m "feat(backend): audit log model + helper + wiring + admin view"
```

---

### Task 3: Customer Support page (frontend)

**Files:**
- Modify: `frontend/src/types/app.ts` (`Ticket`, `TicketMessage`)
- Create: `frontend/src/pages/SupportPage.tsx`
- Modify: `frontend/src/routes/AppRoutes.tsx` (`/support`)
- Modify: `frontend/src/pages/DashboardPage.tsx` (Support link)
- Test: `frontend/src/pages/__tests__/support.test.tsx`

**Interfaces:**
- `TicketMessage { authorRole: string; body: string; at: string }`; `Ticket { _id; category; subject; status; messages: TicketMessage[]; updatedAt }`.
- `SupportPage`: lists my tickets (`GET /api/tickets`); a "New ticket" form (category select + subject + message) → `POST /api/tickets`; selecting a ticket shows the thread + a reply box → `POST /api/tickets/:id/messages`.

- [ ] **Step 1: `types/app.ts`** — add:
```ts
export interface TicketMessage { authorRole: string; body: string; at: string }
export interface Ticket { _id: string; category: string; subject: string; status: string; messages: TicketMessage[]; updatedAt: string }
```

- [ ] **Step 2: Create `frontend/src/pages/SupportPage.tsx`**
```tsx
import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { apiGet, apiPost } from '@/lib/api'
import type { Ticket } from '@/types/app'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'
const CATEGORIES = ['legal', 'payment', 'documents', 'technical', 'other']

export default function SupportPage() {
  const [items, setItems] = useState<Ticket[]>([])
  const [sel, setSel] = useState<Ticket | null>(null)
  const [form, setForm] = useState({ category: 'other', subject: '', body: '' })
  const [reply, setReply] = useState('')

  const load = () => apiGet<Ticket[]>('/api/tickets').then(setItems).catch(() => setItems([]))
  useEffect(() => { load() }, [])

  async function create(e: FormEvent) {
    e.preventDefault()
    if (!form.subject || !form.body) return
    const t = await apiPost<Ticket>('/api/tickets', form)
    setForm({ category: 'other', subject: '', body: '' }); setSel(t); load()
  }
  async function sendReply() {
    if (!sel || !reply) return
    const t = await apiPost<Ticket>(`/api/tickets/${sel._id}/messages`, { body: reply })
    setSel(t); setReply(''); load()
  }

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto grid max-w-5xl gap-6 px-5 py-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h1 className="text-2xl font-semibold text-frost">Support</h1>
          <form onSubmit={create} className="mt-4 flex flex-col gap-2 rounded-xl border border-frost/10 bg-steel/20 p-4">
            <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className={inputCls} placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <textarea className={inputCls} placeholder="Describe your issue" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            <Button type="submit">Open ticket</Button>
          </form>
          <div className="mt-4 grid gap-2">
            {items.map((t) => (
              <button key={t._id} onClick={() => setSel(t)} className={`rounded-xl border px-4 py-3 text-left ${sel?._id === t._id ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
                <p className="font-medium text-frost">{t.subject}</p>
                <p className="text-sm text-frost/55">{t.category} · {t.status}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          {!sel ? <p className="text-frost/55">Select or open a ticket.</p> : (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-medium text-frost">{sel.subject} <span className="text-sm text-frost/50">({sel.status})</span></h2>
              <div className="grid gap-2">
                {sel.messages.map((m, i) => (
                  <div key={i} className="rounded-lg border border-frost/10 bg-steel/20 px-4 py-2 text-sm">
                    <p className="text-xs uppercase tracking-wider text-frost/40">{m.authorRole}</p>
                    <p className="text-frost">{m.body}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className={inputCls} placeholder="Reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
                <Button onClick={sendReply}>Send</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Route + nav** — in `AppRoutes.tsx` ProtectedRoute group: `import SupportPage from '@/pages/SupportPage'` + `<Route path="/support" element={<SupportPage />} />`. In `DashboardPage.tsx` header actions add `<Link to="/support"><Button variant="ghost">Support</Button></Link>`.

- [ ] **Step 4: Write the failing test `frontend/src/pages/__tests__/support.test.tsx`**
```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SupportPage from '../SupportPage'

afterEach(() => vi.restoreAllMocks())

describe('SupportPage', () => {
  it('lists tickets and opens a thread', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string, opts?: RequestInit) => {
      if (opts?.method === 'POST') return new Response(JSON.stringify({ _id: 't1', category: 'other', subject: 'New', status: 'open', messages: [{ authorRole: 'customer', body: 'hi', at: '' }], updatedAt: '' }), { status: 201 })
      return new Response(JSON.stringify([{ _id: 't1', category: 'documents', subject: 'Help', status: 'open', messages: [{ authorRole: 'customer', body: 'issue', at: '' }], updatedAt: '' }]), { status: 200 })
    }))
    render(<MemoryRouter><SupportPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Help')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Help'))
    expect(screen.getByText('issue')).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run it — expect PASS**

Run: `cd frontend && npm test src/pages/__tests__/support.test.tsx`

- [ ] **Step 6: Commit**
```bash
git add frontend/src/types/app.ts frontend/src/pages/SupportPage.tsx frontend/src/routes/AppRoutes.tsx frontend/src/pages/DashboardPage.tsx frontend/src/pages/__tests__/support.test.tsx
git commit -m "feat(web): customer support page (tickets + thread)"
```

---

### Task 4: Staff Tickets panel + Admin Audit view (frontend)

**Files:**
- Create: `frontend/src/components/staff/TicketsPanel.tsx`
- Create: `frontend/src/components/staff/AuditPanel.tsx`
- Modify: `frontend/src/pages/StaffPage.tsx` (render both by role)
- Modify: `frontend/src/types/app.ts` (`AuditEntry`)
- Test: `frontend/src/components/staff/__tests__/tickets-panel.test.tsx`

**Interfaces:**
- `TicketsPanel` (legal/compliance/support/admin): lists `GET /api/staff/tickets`; open one → thread + reply (`POST /api/staff/tickets/:id/messages`) + close/reopen (`PATCH /api/staff/tickets/:id`).
- `AuditPanel` (admin only): lists `GET /api/admin/audit` in a table (time, actor, action, target).
- `StaffPage` renders `<TicketsPanel/>` for `support`/`legal`/`compliance`/`admin`, and `<AuditPanel/>` for `admin`.

- [ ] **Step 1: `types/app.ts`** — add:
```ts
export interface AuditEntry { _id: string; actorRole: string; action: string; target: string; ip: string; at: string; actorId?: { email?: string } | string | null }
```

- [ ] **Step 2: Create `frontend/src/components/staff/TicketsPanel.tsx`**
```tsx
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { apiGet, apiPost, apiPatch } from '@/lib/api'
import type { Ticket } from '@/types/app'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-3 py-2 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function TicketsPanel() {
  const [items, setItems] = useState<Ticket[]>([])
  const [sel, setSel] = useState<Ticket | null>(null)
  const [reply, setReply] = useState('')
  const load = useCallback(() => apiGet<Ticket[]>('/api/staff/tickets').then(setItems).catch(() => setItems([])), [])
  useEffect(() => { load() }, [load])
  const open = async (id: string) => setSel(await apiGet<Ticket>(`/api/staff/tickets/${id}`))
  async function send() { if (!sel || !reply) return; const t = await apiPost<Ticket>(`/api/staff/tickets/${sel._id}/messages`, { body: reply }); setSel(t); setReply(''); load() }
  async function setStatus(status: string) { if (!sel) return; const t = await apiPatch<Ticket>(`/api/staff/tickets/${sel._id}`, { status }); setSel(t); load() }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-frost">Support tickets</h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="grid gap-2">
          {items.length === 0 && <p className="text-sm text-frost/55">No tickets.</p>}
          {items.map((t) => (
            <button key={t._id} onClick={() => open(t._id)} className={`rounded-xl border px-4 py-3 text-left ${sel?._id === t._id ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
              <p className="font-medium text-frost">{t.subject}</p>
              <p className="text-sm text-frost/55">{t.category} · {t.status}</p>
            </button>
          ))}
        </div>
        <div>
          {!sel ? <p className="text-frost/55">Select a ticket.</p> : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-frost">{sel.subject}</h3>
                <Button size="sm" variant="outline" onClick={() => setStatus(sel.status === 'open' ? 'closed' : 'open')}>{sel.status === 'open' ? 'Close' : 'Reopen'}</Button>
              </div>
              <div className="grid gap-2">
                {sel.messages.map((m, i) => (
                  <div key={i} className="rounded-lg border border-frost/10 bg-steel/20 px-4 py-2 text-sm">
                    <p className="text-xs uppercase tracking-wider text-frost/40">{m.authorRole}</p>
                    <p className="text-frost">{m.body}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className={inputCls} placeholder="Reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
                <Button onClick={send}>Send</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `frontend/src/components/staff/AuditPanel.tsx`**
```tsx
import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import type { AuditEntry } from '@/types/app'

const actorEmail = (e: AuditEntry) => (typeof e.actorId === 'object' && e.actorId ? e.actorId.email ?? e.actorRole : e.actorRole)

export default function AuditPanel() {
  const [items, setItems] = useState<AuditEntry[]>([])
  useEffect(() => { apiGet<AuditEntry[]>('/api/admin/audit').then(setItems).catch(() => setItems([])) }, [])
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-frost">Audit log</h2>
      <div className="mt-4 grid gap-1">
        {items.length === 0 && <p className="text-sm text-frost/55">No audit entries.</p>}
        {items.map((e) => (
          <div key={e._id} className="flex items-center justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-2 text-xs">
            <span className="text-frost">{e.action} <span className="text-frost/50">{e.target}</span></span>
            <span className="text-frost/50">{actorEmail(e)} · {e.ip} · {e.at ? new Date(e.at).toISOString().slice(0, 16).replace('T', ' ') : ''}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: `StaffPage.tsx`** — import both and render by role:
```tsx
import TicketsPanel from '@/components/staff/TicketsPanel'
import AuditPanel from '@/components/staff/AuditPanel'
// inside component, after existing panels:
const showTickets = ['support', 'legal', 'compliance', 'admin'].includes(role)
// in JSX:
{showTickets && <TicketsPanel />}
{role === 'admin' && <AuditPanel />}
```

- [ ] **Step 5: Write the failing test `frontend/src/components/staff/__tests__/tickets-panel.test.tsx`**
```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TicketsPanel from '../TicketsPanel'

afterEach(() => vi.restoreAllMocks())

describe('TicketsPanel', () => {
  it('lists tickets and opens a thread', async () => {
    const T = { _id: 't1', category: 'documents', subject: 'Help', status: 'open', messages: [{ authorRole: 'customer', body: 'issue', at: '' }], updatedAt: '' }
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('/api/staff/tickets/t1')) return new Response(JSON.stringify(T), { status: 200 })
      return new Response(JSON.stringify([T]), { status: 200 })
    }))
    render(<TicketsPanel />)
    await waitFor(() => expect(screen.getByText('Help')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Help'))
    await waitFor(() => expect(screen.getByText('issue')).toBeInTheDocument())
  })
})
```

- [ ] **Step 6: Run it — expect PASS**

Run: `cd frontend && npm test src/components/staff/__tests__/tickets-panel.test.tsx`

- [ ] **Step 7: Commit**
```bash
git add frontend/src/components/staff/TicketsPanel.tsx frontend/src/components/staff/AuditPanel.tsx frontend/src/pages/StaffPage.tsx frontend/src/types/app.ts frontend/src/components/staff/__tests__/tickets-panel.test.tsx
git commit -m "feat(web): staff tickets panel + admin audit panel"
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
git commit -m "chore: phase 8 green"
```

---

## Self-Review Notes (coverage vs design §2–§7)

- Ticket model + customer routes → Task 1. ✅
- Staff ticket routes + notify → Task 1. ✅
- Audit model + logAudit + wiring → Task 2. ✅
- Admin audit view endpoint → Task 2. ✅
- Seed ticket + audit → Task 2. ✅
- Customer Support page → Task 3. ✅
- Staff Tickets panel + Admin Audit panel → Task 4. ✅
- CRM (calls/WhatsApp) → deferred (noted). ✅
