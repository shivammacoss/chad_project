# Phase 5 — Notifications & Email Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In-app notification bell + best-effort transactional email, fired by a single `notifyUser` helper at four workflow events (submitted, paid, document rejected, approved/certificate).

**Architecture:** A `Notification` collection + `notifyUser` helper (creates a notification and best-effort emails). Customer notification routes. Events call `notifyUser`. Frontend adds a `NotificationBell` in the navbar.

**Tech Stack:** Express + TS + MongoDB (`backend/`), Nodemailer (existing), Vite/React + TS (`frontend/`), Vitest.

## Global Constraints

- Backend under `backend/`, frontend under `frontend/`. TS ESM / TSX.
- Notification `type` values: `payment | document | status | certificate | info`.
- Email sends are best-effort: `notifyUser` must NOT throw if email fails (try/catch + log).
- Existing flows (auth verification email, all routes) unchanged. Each task ends green and is committed.

---

### Task 1: Notification model + notify lib + routes (backend)

**Files:**
- Create: `backend/src/models/Notification.ts`
- Modify: `backend/src/lib/email.ts` (add `sendNotificationEmail`)
- Create: `backend/src/lib/notify.ts`
- Create: `backend/src/routes/notifications.ts`
- Modify: `backend/src/app.ts` (mount `/api/notifications`)
- Test: `backend/src/__tests__/notifications.test.ts`

**Interfaces:**
- `Notification` model: `userId`, `type`, `title`, `body`, `link` (default ''), `read` (default false), `createdAt`.
- `sendNotificationEmail(to, title, body): Promise<void>` in `email.ts`.
- `notifyUser(userId, { type, title, body, link? }): Promise<void>` in `notify.ts` — creates the notification then best-effort emails (looks up user email; try/catch swallows email errors).
- Routes (requireAuth, scoped to `req.userId`): `GET /api/notifications`, `GET /api/notifications/unread-count`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`.

- [ ] **Step 1: Create `backend/src/models/Notification.ts`**
```ts
import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['payment', 'document', 'status', 'certificate', 'info'], default: 'info' },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  link: { type: String, default: '' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() },
})

export type INotification = InferSchemaType<typeof notificationSchema>
export const Notification = mongoose.model('Notification', notificationSchema)
```

- [ ] **Step 2: Add `sendNotificationEmail` to `backend/src/lib/email.ts`**

Append (reusing the existing private `getTransport`):
```ts
export async function sendNotificationEmail(to: string, title: string, body: string): Promise<void> {
  await getTransport().sendMail({
    from: process.env.EMAIL_FROM ?? 'no-reply@example.com',
    to,
    subject: `${title} — Chad Business Assist`,
    html: `<h2>${title}</h2><p>${body}</p><p style="color:#888">— Chad Business Assist</p>`,
  })
}
```

- [ ] **Step 3: Create `backend/src/lib/notify.ts`**
```ts
import { Notification } from '../models/Notification.js'
import { User } from '../models/User.js'
import { sendNotificationEmail } from './email.js'

export async function notifyUser(
  userId: unknown,
  opts: { type: 'payment' | 'document' | 'status' | 'certificate' | 'info'; title: string; body: string; link?: string },
): Promise<void> {
  await Notification.create({
    userId,
    type: opts.type,
    title: opts.title,
    body: opts.body,
    link: opts.link ?? '',
  })
  try {
    const user = await User.findById(userId).select('email')
    if (user?.email) await sendNotificationEmail(user.email, opts.title, opts.body)
  } catch (err) {
    console.warn('notifyUser: email send failed (ignored):', (err as Error).message)
  }
}
```

- [ ] **Step 4: Create `backend/src/routes/notifications.ts`**
```ts
import { Router } from 'express'
import { Notification } from '../models/Notification.js'
import { requireAuth } from '../middleware/auth.js'

export const notificationsRouter = Router()
notificationsRouter.use(requireAuth)

notificationsRouter.get('/', async (req, res) => {
  const list = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50)
  res.json(list)
})

notificationsRouter.get('/unread-count', async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.userId, read: false })
  res.json({ count })
})

notificationsRouter.patch('/:id/read', async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { read: true }, { new: true })
  if (!n) return res.status(404).json({ error: 'Not found' })
  res.json(n)
})

notificationsRouter.patch('/read-all', async (req, res) => {
  await Notification.updateMany({ userId: req.userId, read: false }, { read: true })
  res.json({ ok: true })
})
```

- [ ] **Step 5: Mount in `backend/src/app.ts`**
```ts
import { notificationsRouter } from './routes/notifications.js'
// ...
app.use('/api/notifications', notificationsRouter)
```

- [ ] **Step 6: Write the failing test `backend/src/__tests__/notifications.test.ts`**
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'
import { __setTransport } from '../lib/email.js'
import { notifyUser } from '../lib/notify.js'
import { Notification } from '../models/Notification.js'

const app = createApp()

beforeEach(() => { __setTransport({ sendMail: vi.fn(async () => ({})) }) })

async function authed() {
  const u = await User.create({ email: 'n@x.com', passwordHash: await hashPassword('secret123'), fullName: 'N', country: 'IN', emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'n@x.com', password: 'secret123' })
  return { agent, userId: String(u._id) }
}

describe('notifications', () => {
  it('notifyUser creates a notification and does not throw on email failure', async () => {
    __setTransport({ sendMail: vi.fn(async () => { throw new Error('smtp down') }) })
    const u = await User.create({ email: 'z@x.com', passwordHash: 'x', fullName: 'Z', country: 'IN' })
    await expect(notifyUser(u._id, { type: 'info', title: 'Hi', body: 'there' })).resolves.toBeUndefined()
    expect(await Notification.countDocuments({ userId: u._id })).toBe(1)
  })

  it('lists, counts unread, and marks read', async () => {
    const { agent, userId } = await authed()
    await notifyUser(userId, { type: 'payment', title: 'Paid', body: 'ok', link: '/dashboard' })
    await notifyUser(userId, { type: 'status', title: 'Update', body: 'x' })
    const list = await agent.get('/api/notifications')
    expect(list.body.length).toBe(2)
    const count = await agent.get('/api/notifications/unread-count')
    expect(count.body.count).toBe(2)
    await agent.patch(`/api/notifications/${list.body[0]._id}/read`)
    const count2 = await agent.get('/api/notifications/unread-count')
    expect(count2.body.count).toBe(1)
    await agent.patch('/api/notifications/read-all')
    const count3 = await agent.get('/api/notifications/unread-count')
    expect(count3.body.count).toBe(0)
  })
})
```

- [ ] **Step 7: Run it — expect PASS**

Run: `cd backend && npm test src/__tests__/notifications.test.ts` then `cd backend && npm test && npm run typecheck`

- [ ] **Step 8: Commit**
```bash
git add backend/src/models/Notification.ts backend/src/lib/email.ts backend/src/lib/notify.ts backend/src/routes/notifications.ts backend/src/app.ts backend/src/__tests__/notifications.test.ts
git commit -m "feat(backend): notification model + notify helper + notification routes"
```

---

### Task 2: Wire notify into workflow events + seed (backend)

**Files:**
- Modify: `backend/src/routes/applications.ts` (submit → notify)
- Modify: `backend/src/routes/payments.ts` (webhook paid → notify)
- Modify: `backend/src/routes/staff.ts` (document reject → notify; issue-certificate → notify)
- Modify: `backend/src/seed.ts` (seed a couple notifications)
- Test: `backend/src/__tests__/notify.events.test.ts`

**Interfaces:**
- After each event mutation, call `notifyUser(app.userId, …)`. Events: submit (`documents_submitted`), webhook `paid`, staff document `rejected` (include reason + link to the doc's application), `issue-certificate` (include regNo).

- [ ] **Step 1: `applications.ts` submit** — import `notifyUser` and, in the `POST /:id/submit` handler after `await app.save()`:
```ts
import { notifyUser } from '../lib/notify.js'
// ...
await notifyUser(app.userId, { type: 'status', title: 'Application received', body: `We received your ${app.serviceName} application and will review your documents.`, link: `/applications/${app._id}` })
```

- [ ] **Step 2: `payments.ts` webhook** — import `notifyUser`; in the webhook handler after marking paid (`await app.save()`):
```ts
import { notifyUser } from '../lib/notify.js'
// ...
await notifyUser(app.userId, { type: 'payment', title: 'Payment received', body: `Your payment for ${app.serviceName} was received. Your application is now in processing.`, link: `/applications/${app._id}` })
```

- [ ] **Step 3: `staff.ts` document reject + issue-certificate** — import `notifyUser`.
In `PATCH /documents/:id`, when `status === 'rejected'`, after updating the document, look up its application to get `userId` + id and notify:
```ts
import { notifyUser } from '../lib/notify.js'
import { Application } from '../models/Application.js' // already imported
// in the documents PATCH handler, after `const doc = await DocumentModel.findByIdAndUpdate(...)`:
if (doc && status === 'rejected') {
  const parent = await Application.findById(doc.applicationId).select('userId')
  if (parent) await notifyUser(parent.userId, { type: 'document', title: 'A document needs attention', body: reason || 'Please re-upload the requested document.', link: `/applications/${doc.applicationId}` })
}
```
In `POST /applications/:id/issue-certificate`, after `await app.save()` (regNo assigned):
```ts
await notifyUser(app.userId, { type: 'certificate', title: 'Your company is registered!', body: `Certificate ${app.companyRegNo} is ready to download.`, link: `/applications/${app._id}` })
```

- [ ] **Step 4: Seed notifications** in `backend/src/seed.ts` — import `Notification` and after creating apps add a couple for the demo user:
```ts
import { Notification } from './models/Notification.js'
// near the end, after apps created:
const regApp = created.find((a) => a.status === 'registered')
await Notification.deleteMany({})
await Notification.create({ userId: user._id, type: 'payment', title: 'Payment received', body: 'Your payment was received. Application in processing.', link: regApp ? `/applications/${regApp._id}` : '/dashboard', read: false })
await Notification.create({ userId: user._id, type: 'certificate', title: 'Your company is registered!', body: 'Your Certificate of Incorporation is ready to download.', link: regApp ? `/applications/${regApp._id}` : '/dashboard', read: false })
```

- [ ] **Step 5: Write the failing test `backend/src/__tests__/notify.events.test.ts`**
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'
import { __setTransport } from '../lib/email.js'
import { Notification } from '../models/Notification.js'

const app = createApp()
beforeEach(() => { __setTransport({ sendMail: vi.fn(async () => ({})) }) })

async function login(role: string, email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('notify on events', () => {
  it('notifies the customer when a staff member rejects a document', async () => {
    const customer = await login('customer', 'c@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const up = await customer.post(`/api/applications/${created.body._id}/documents`)
      .field('type', 'passport').field('ownerName', 'A')
      .attach('file', Buffer.from('x'), { filename: 'p.pdf', contentType: 'application/pdf' })
    const cust = await User.findOne({ email: 'c@x.com' })
    const legal = await login('legal', 'l@x.com')
    await legal.patch(`/api/staff/documents/${up.body._id}`).send({ status: 'rejected', reason: 'Blurry' })
    const notes = await Notification.find({ userId: cust!._id, type: 'document' })
    expect(notes.length).toBe(1)
    expect(notes[0].body).toContain('Blurry')
  })
})
```

- [ ] **Step 6: Run it + full suite — expect PASS**

Run: `cd backend && npm test src/__tests__/notify.events.test.ts` then `cd backend && npm test && npm run typecheck`

- [ ] **Step 7: Commit**
```bash
git add backend/src/routes/applications.ts backend/src/routes/payments.ts backend/src/routes/staff.ts backend/src/seed.ts backend/src/__tests__/notify.events.test.ts
git commit -m "feat(backend): notify customer on submit/paid/reject/certificate + seed notifications"
```

---

### Task 3: NotificationBell + navbar (frontend)

**Files:**
- Modify: `frontend/src/types/app.ts` (`Notification` type)
- Create: `frontend/src/components/layout/NotificationBell.tsx`
- Modify: `frontend/src/components/layout/Navbar.tsx` (render bell in the authenticated cluster)
- Test: `frontend/src/components/layout/__tests__/notification-bell.test.tsx`

**Interfaces:**
- `Notification` type: `{ _id: string; type: string; title: string; body: string; link: string; read: boolean; createdAt: string }`.
- `NotificationBell`: on mount fetches `GET /api/notifications/unread-count` → badge; on click toggles a dropdown that fetches `GET /api/notifications`; each item is clickable → `PATCH /api/notifications/:id/read` then navigate to `link` (or `/dashboard`); a "Mark all read" button → `PATCH /api/notifications/read-all` then refresh count. Closes on item click.

- [ ] **Step 1: `frontend/src/types/app.ts`** — add:
```ts
export interface Notification {
  _id: string; type: string; title: string; body: string; link: string; read: boolean; createdAt: string
}
```

- [ ] **Step 2: Create `frontend/src/components/layout/NotificationBell.tsx`**
```tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPatch } from '@/lib/api'
import type { Notification } from '@/types/app'

export default function NotificationBell() {
  const navigate = useNavigate()
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])

  const loadCount = () => apiGet<{ count: number }>('/api/notifications/unread-count').then((r) => setCount(r.count)).catch(() => {})
  useEffect(() => { loadCount() }, [])

  async function toggle() {
    const next = !open
    setOpen(next)
    if (next) setItems(await apiGet<Notification[]>('/api/notifications').catch(() => []))
  }
  async function openItem(n: Notification) {
    if (!n.read) await apiPatch(`/api/notifications/${n._id}/read`, {}).catch(() => {})
    setOpen(false); loadCount()
    navigate(n.link || '/dashboard')
  }
  async function markAll() {
    await apiPatch('/api/notifications/read-all', {}).catch(() => {})
    setItems((xs) => xs.map((x) => ({ ...x, read: true }))); setCount(0)
  }

  return (
    <div className="relative">
      <button type="button" onClick={toggle} className="relative text-frost/70 hover:text-frost" aria-label="Notifications">
        <span className="text-lg">🔔</span>
        {count > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-pulse px-1 text-[10px] font-semibold text-frost">{count}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-frost/15 bg-steel/95 p-2 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-sm font-medium text-frost">Notifications</span>
            <button className="text-xs text-teal-electric" onClick={markAll}>Mark all read</button>
          </div>
          {items.length === 0 && <p className="px-2 py-3 text-sm text-frost/55">No notifications.</p>}
          {items.map((n) => (
            <button key={n._id} onClick={() => openItem(n)}
              className={`block w-full rounded-lg px-2 py-2 text-left text-sm ${n.read ? 'text-frost/55' : 'bg-navy/40 text-frost'}`}>
              <span className="font-medium">{n.title}</span>
              <span className="block text-xs text-frost/55">{n.body}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Wire `<NotificationBell />` into `Navbar.tsx`** — in the authenticated (logged-in) cluster, before "Log out", render `<NotificationBell />` for the desktop cluster (and, if straightforward, the mobile cluster). Import it at top: `import NotificationBell from '@/components/layout/NotificationBell'`. Place `{user && <NotificationBell />}` adjacent to the Dashboard/Log out controls.

- [ ] **Step 4: Write the failing test `frontend/src/components/layout/__tests__/notification-bell.test.tsx`**
```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import NotificationBell from '../NotificationBell'

afterEach(() => vi.restoreAllMocks())

describe('NotificationBell', () => {
  it('shows the unread count and lists notifications on open', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('unread-count')) return new Response(JSON.stringify({ count: 2 }), { status: 200 })
      if (url.includes('/api/notifications')) return new Response(JSON.stringify([
        { _id: 'n1', type: 'payment', title: 'Payment received', body: 'ok', link: '/dashboard', read: false, createdAt: '' },
      ]), { status: 200 })
      return new Response('{}', { status: 200 })
    }))
    render(<MemoryRouter><NotificationBell /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument())
    await userEvent.click(screen.getByLabelText('Notifications'))
    await waitFor(() => expect(screen.getByText('Payment received')).toBeInTheDocument())
  })
})
```

- [ ] **Step 5: Run it — expect PASS**

Run: `cd frontend && npm test src/components/layout/__tests__/notification-bell.test.tsx`

- [ ] **Step 6: Commit**
```bash
git add frontend/src/types/app.ts frontend/src/components/layout/NotificationBell.tsx frontend/src/components/layout/Navbar.tsx frontend/src/components/layout/__tests__/notification-bell.test.tsx
git commit -m "feat(web): notification bell in navbar"
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
git commit -m "chore: phase 5 green"
```

---

## Self-Review Notes (coverage vs design §2–§7)

- Notification model → Task 1. ✅
- notify helper (in-app + best-effort email) → Task 1. ✅
- Notification routes (list/unread-count/read/read-all) → Task 1. ✅
- Wire submit/paid/reject/certificate events → Task 2. ✅
- Seed notifications → Task 2. ✅
- NotificationBell + navbar → Task 3. ✅
- Email best-effort (no throw) → Task 1 (notify try/catch). ✅
