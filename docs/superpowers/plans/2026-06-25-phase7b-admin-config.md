# Phase 7b — Admin Service-Catalog Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** DB-backed, admin-editable service catalog.

**Architecture:** A `Service` collection seeded from the code `SERVICES` default; a `serviceStore` providing async `getServiceDef`/`listServices`/`seedServicesIfEmpty`. `/api/services` and generic-order pricing read from the DB. Admin CRUD + UI to edit.

**Tech Stack:** Express + TS + MongoDB (`backend/`), Vite/React + TS (`frontend/`), Vitest.

## Global Constraints

- Backend under `backend/`, frontend under `frontend/`. TS ESM / TSX.
- Service `flow` values `formation | generic`. Catalog is the single source for the public list + generic pricing; formation entity pricing stays code-based.
- Seeding is idempotent (only when the collection is empty). Each task ends green and is committed.

---

### Task 1: Service model + serviceStore + DB-backed catalog (backend)

**Files:**
- Create: `backend/src/models/Service.ts`
- Create: `backend/src/lib/serviceStore.ts`
- Modify: `backend/src/routes/services.ts` (read DB)
- Modify: `backend/src/routes/applications.ts` (async getServiceDef)
- Modify: `backend/src/index.ts` (seed on boot)
- Modify: `backend/src/seed.ts` (seed services)
- Test: `backend/src/__tests__/serviceStore.test.ts`

**Interfaces:**
- `Service` model: `key` (unique), `category`, `name`, `blurb`, `priceCents`, `flow`, `intakeFields` (Mixed[]), `requiredDocuments` ([String]), `active` (default true), `createdAt`.
- `serviceStore.ts`: `seedServicesIfEmpty(): Promise<void>`; `listServices(activeOnly=true): Promise<ServiceDef[]>`; `getServiceDef(key): Promise<ServiceDef | null>`. (`ServiceDef` reused from `services.ts`.)

- [ ] **Step 1: Create `backend/src/models/Service.ts`**
```ts
import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const serviceSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  category: { type: String, default: '' },
  name: { type: String, required: true },
  blurb: { type: String, default: '' },
  priceCents: { type: Number, required: true },
  flow: { type: String, enum: ['formation', 'generic'], default: 'generic' },
  intakeFields: { type: [Schema.Types.Mixed], default: [] },
  requiredDocuments: { type: [String], default: [] },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: () => new Date() },
})

export type IService = InferSchemaType<typeof serviceSchema>
export const Service = mongoose.model('Service', serviceSchema)
```

- [ ] **Step 2: Create `backend/src/lib/serviceStore.ts`**
```ts
import { Service } from '../models/Service.js'
import { SERVICES, type ServiceDef } from './services.js'

function toDef(doc: { key: string; category: string; name: string; blurb: string; priceCents: number; flow: string; intakeFields: unknown[]; requiredDocuments: string[] }): ServiceDef {
  return {
    key: doc.key, category: doc.category, name: doc.name, blurb: doc.blurb,
    priceCents: doc.priceCents, flow: doc.flow as ServiceDef['flow'],
    intakeFields: doc.intakeFields as ServiceDef['intakeFields'], requiredDocuments: doc.requiredDocuments,
  }
}

export async function seedServicesIfEmpty(): Promise<void> {
  const count = await Service.countDocuments({})
  if (count === 0) await Service.insertMany(SERVICES.map((s) => ({ ...s, active: true })))
}

export async function listServices(activeOnly = true): Promise<ServiceDef[]> {
  await seedServicesIfEmpty()
  const docs = await Service.find(activeOnly ? { active: true } : {}).sort({ category: 1, name: 1 })
  return docs.map((d) => toDef(d as never))
}

export async function getServiceDef(key: string): Promise<ServiceDef | null> {
  await seedServicesIfEmpty()
  const doc = await Service.findOne({ key, active: true })
  return doc ? toDef(doc as never) : null
}
```

- [ ] **Step 3: `backend/src/routes/services.ts`** — read from DB:
```ts
import { Router } from 'express'
import { listServices } from '../lib/serviceStore.js'
import { SERVICES } from '../lib/services.js'

export const servicesRouter = Router()
servicesRouter.get('/', async (_req, res) => {
  try { res.json(await listServices(true)) } catch { res.json(SERVICES) }
})
```

- [ ] **Step 4: `backend/src/routes/applications.ts`** — make the service lookup async. Change the import to `import { getServiceDef } from '../lib/serviceStore.js'` and in the POST handler:
```ts
  const service = await getServiceDef(serviceKey)
  if (!service) return res.status(400).json({ error: 'Unknown service' })
```
Replace `priceForOrder(serviceKey)` with `service.priceCents`. (Keep the `totalPrice`/`priceFor` imports for formation pricing — those stay.)

- [ ] **Step 5: `backend/src/index.ts`** — seed on boot. After `connectDb`:
```ts
import { seedServicesIfEmpty } from './lib/serviceStore.js'
// ...
  await connectDb(process.env.MONGODB_URI!)
  await seedServicesIfEmpty()
```

- [ ] **Step 6: `backend/src/seed.ts`** — ensure services seeded: import `seedServicesIfEmpty` and call it (after clearing collections, before/after apps): `await seedServicesIfEmpty()`.

- [ ] **Step 7: Write the failing test `backend/src/__tests__/serviceStore.test.ts`**
```ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { Service } from '../models/Service.js'
import { listServices, getServiceDef } from '../lib/serviceStore.js'

const app = createApp()

describe('serviceStore', () => {
  it('seeds the catalog and lists active services', async () => {
    const list = await listServices(true)
    expect(list.length).toBeGreaterThan(0)
    expect(list.find((s) => s.key === 'company-formation')).toBeTruthy()
    expect(await Service.countDocuments({})).toBeGreaterThan(0)
  })
  it('GET /api/services returns DB services', async () => {
    const res = await request(app).get('/api/services')
    expect(res.status).toBe(200)
    expect(res.body.find((s: { key: string }) => s.key === 'virtual-office')).toBeTruthy()
  })
  it('getServiceDef returns null for inactive/unknown', async () => {
    await listServices() // ensure seeded
    await Service.findOneAndUpdate({ key: 'trademark' }, { active: false })
    expect(await getServiceDef('trademark')).toBeNull()
    expect(await getServiceDef('nope')).toBeNull()
  })
})
```

- [ ] **Step 8: Run it + full suite — expect PASS**

Run: `cd backend && npm test src/__tests__/serviceStore.test.ts` then `cd backend && npm test && npm run typecheck`

- [ ] **Step 9: Commit**
```bash
git add backend/src/models/Service.ts backend/src/lib/serviceStore.ts backend/src/routes/services.ts backend/src/routes/applications.ts backend/src/index.ts backend/src/seed.ts backend/src/__tests__/serviceStore.test.ts
git commit -m "feat(backend): DB-backed service catalog (Service model + serviceStore)"
```

---

### Task 2: Admin service CRUD (backend)

**Files:**
- Modify: `backend/src/routes/admin.ts` (services CRUD)
- Test: `backend/src/__tests__/admin.services.test.ts`

**Interfaces:** (requireAuth+requireAdmin via router)
- `GET /api/admin/services` — all services (incl. inactive).
- `POST /api/admin/services` { key, name, category, priceCents, flow?, blurb?, requiredDocuments?, intakeFields? } → create.
- `PATCH /api/admin/services/:key` { name?, priceCents?, blurb?, active?, requiredDocuments? } → update. `logAudit`.

- [ ] **Step 1: Add to `backend/src/routes/admin.ts`**

Add imports `import { Service } from '../models/Service.js'` (logAudit already imported). Add routes:
```ts
adminRouter.get('/services', async (_req, res) => {
  res.json(await Service.find({}).sort({ category: 1, name: 1 }))
})
adminRouter.post('/services', async (req, res) => {
  const { key, name, priceCents } = req.body ?? {}
  if (!key || !name || typeof priceCents !== 'number') return res.status(400).json({ error: 'key, name, priceCents required' })
  if (await Service.findOne({ key })) return res.status(409).json({ error: 'key exists' })
  const svc = await Service.create({
    key, name, category: req.body.category ?? '', blurb: req.body.blurb ?? '',
    priceCents, flow: req.body.flow === 'formation' ? 'formation' : 'generic',
    requiredDocuments: req.body.requiredDocuments ?? [], intakeFields: req.body.intakeFields ?? [],
  })
  await logAudit(req, 'service.create', `service:${key}`, { priceCents })
  res.status(201).json(svc)
})
adminRouter.patch('/services/:key', async (req, res) => {
  const allowed: Record<string, unknown> = {}
  for (const f of ['name', 'priceCents', 'blurb', 'active', 'requiredDocuments', 'category']) {
    if (req.body?.[f] !== undefined) allowed[f] = req.body[f]
  }
  const svc = await Service.findOneAndUpdate({ key: req.params.key }, allowed, { new: true })
  if (!svc) return res.status(404).json({ error: 'Not found' })
  await logAudit(req, 'service.update', `service:${req.params.key}`, allowed)
  res.json(svc)
})
```

- [ ] **Step 2: Write the failing test `backend/src/__tests__/admin.services.test.ts`**
```ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()
async function login(role: string, email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('admin services CRUD', () => {
  it('admin lists, creates, updates price + active; public catalog reflects it', async () => {
    const admin = await login('admin', 'a@x.com')
    const all = await admin.get('/api/admin/services')
    expect(all.status).toBe(200)
    expect(all.body.length).toBeGreaterThan(0)

    const created = await admin.post('/api/admin/services').send({ key: 'logo-design', name: 'Logo Design', category: 'Corporate Services', priceCents: 15000 })
    expect(created.status).toBe(201)

    const pub1 = await request(app).get('/api/services')
    expect(pub1.body.find((s: { key: string }) => s.key === 'logo-design')).toBeTruthy()

    await admin.patch('/api/admin/services/logo-design').send({ priceCents: 18000, active: false })
    const pub2 = await request(app).get('/api/services')
    expect(pub2.body.find((s: { key: string }) => s.key === 'logo-design')).toBeFalsy() // inactive hidden
  })

  it('blocks non-admins', async () => {
    const legal = await login('legal', 'l@x.com')
    expect((await legal.get('/api/admin/services')).status).toBe(403)
  })
})
```

- [ ] **Step 3: Run it — expect PASS**

Run: `cd backend && npm test src/__tests__/admin.services.test.ts` then `cd backend && npm test && npm run typecheck`

- [ ] **Step 4: Commit**
```bash
git add backend/src/routes/admin.ts backend/src/__tests__/admin.services.test.ts
git commit -m "feat(backend): admin service CRUD + audit"
```

---

### Task 3: Admin ServicesPanel (frontend)

**Files:**
- Modify: `frontend/src/types/app.ts` (`AdminService`)
- Create: `frontend/src/components/staff/ServicesPanel.tsx`
- Modify: `frontend/src/pages/StaffPage.tsx` (render for admin)
- Test: `frontend/src/components/staff/__tests__/services-panel.test.tsx`

**Interfaces:**
- `AdminService { _id; key; category; name; priceCents; flow; active }`.
- `ServicesPanel` (admin): lists `GET /api/admin/services`; each row shows name/category/price + an Active toggle (`PATCH /api/admin/services/:key { active }`) + an inline price edit (`PATCH … { priceCents }`); an "Add service" form (key, name, category, price). Refetch after changes.

- [ ] **Step 1: `types/app.ts`** — add:
```ts
export interface AdminService { _id: string; key: string; category: string; name: string; priceCents: number; flow: string; active: boolean }
```

- [ ] **Step 2: Create `frontend/src/components/staff/ServicesPanel.tsx`**
```tsx
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/content/formations'
import { apiGet, apiPost, apiPatch } from '@/lib/api'
import type { AdminService } from '@/types/app'

const inputCls = 'rounded-lg border border-frost/15 bg-navy px-3 py-2 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function ServicesPanel() {
  const [items, setItems] = useState<AdminService[]>([])
  const [form, setForm] = useState({ key: '', name: '', category: '', priceUsd: '' })
  const load = useCallback(() => apiGet<AdminService[]>('/api/admin/services').then(setItems).catch(() => setItems([])), [])
  useEffect(() => { load() }, [load])

  async function toggle(s: AdminService) { await apiPatch(`/api/admin/services/${s.key}`, { active: !s.active }); load() }
  async function setPrice(s: AdminService, usd: string) { const c = Math.round(Number(usd) * 100); if (c >= 0) { await apiPatch(`/api/admin/services/${s.key}`, { priceCents: c }); load() } }
  async function add(e: FormEvent) {
    e.preventDefault()
    if (!form.key || !form.name) return
    await apiPost('/api/admin/services', { key: form.key, name: form.name, category: form.category || 'Other', priceCents: Math.round(Number(form.priceUsd || '0') * 100) })
    setForm({ key: '', name: '', category: '', priceUsd: '' }); load()
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-frost">Service catalog</h2>
      <div className="mt-4 grid gap-2">
        {items.map((s) => (
          <div key={s._id} className="flex items-center justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-2 text-sm">
            <div>
              <p className="font-medium text-frost">{s.name} <span className="text-frost/50">· {s.category} · {s.flow}</span></p>
              <p className="text-frost/55">{formatPrice(s.priceCents)} {!s.active && <span className="text-indigo-pulse">· inactive</span>}</p>
            </div>
            <div className="flex items-center gap-2">
              <input className={`${inputCls} w-24`} type="number" defaultValue={(s.priceCents / 100).toString()} onBlur={(e) => setPrice(s, e.target.value)} />
              <Button size="sm" variant="outline" onClick={() => toggle(s)}>{s.active ? 'Disable' : 'Enable'}</Button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={add} className="mt-4 flex flex-wrap items-end gap-2 rounded-xl border border-frost/10 bg-steel/20 p-4">
        <input className={inputCls} placeholder="key" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} />
        <input className={inputCls} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={inputCls} placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input className={`${inputCls} w-24`} type="number" placeholder="USD" value={form.priceUsd} onChange={(e) => setForm({ ...form, priceUsd: e.target.value })} />
        <Button type="submit" size="sm">Add service</Button>
      </form>
    </section>
  )
}
```

- [ ] **Step 3: `StaffPage.tsx`** — render for admin: `import ServicesPanel from '@/components/staff/ServicesPanel'` and `{role === 'admin' && <ServicesPanel />}`.

- [ ] **Step 4: Write the failing test `frontend/src/components/staff/__tests__/services-panel.test.tsx`**
```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ServicesPanel from '../ServicesPanel'

afterEach(() => vi.restoreAllMocks())

describe('ServicesPanel', () => {
  it('lists services and toggles active', async () => {
    const patch = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', vi.fn(async (_url: string, opts?: RequestInit) => {
      if (opts?.method === 'PATCH') return patch()
      return new Response(JSON.stringify([{ _id: 's1', key: 'virtual-office', category: 'Office', name: 'Virtual Office', priceCents: 20000, flow: 'generic', active: true }]), { status: 200 })
    }))
    render(<ServicesPanel />)
    await waitFor(() => expect(screen.getByText('Virtual Office')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /disable/i }))
    expect(patch).toHaveBeenCalled()
  })
})
```

- [ ] **Step 5: Run it — expect PASS**

Run: `cd frontend && npm test src/components/staff/__tests__/services-panel.test.tsx`

- [ ] **Step 6: Commit**
```bash
git add frontend/src/types/app.ts frontend/src/components/staff/ServicesPanel.tsx frontend/src/pages/StaffPage.tsx frontend/src/components/staff/__tests__/services-panel.test.tsx
git commit -m "feat(web): admin service-catalog panel"
```

---

### Task 4: Full green + verification

- [ ] **Step 1: Full gates**

Run:
```bash
cd backend && npm test && npm run typecheck
cd frontend && npm test && npm run build && npm run lint
```
Expected: all pass, typecheck clean, build clean, 0 lint warnings. Fix any breakage minimally (the async getServiceDef change is the main risk — confirm applications tests still pass).

- [ ] **Step 2: Commit (only if fixes were needed)**
```bash
git add -A
git commit -m "chore: phase 7b green"
```

---

## Self-Review Notes (coverage vs design §2–§4)

- Service model + serviceStore (seed/list/get) → Task 1. ✅
- /api/services + generic pricing from DB → Task 1. ✅
- Boot + seed seeding → Task 1. ✅
- Admin CRUD + audit → Task 2. ✅
- Admin ServicesPanel → Task 3. ✅
- Country scoping → Phase 9 (separate). ✅
