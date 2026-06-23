# V2 Phase B — Backend Data Model + APIs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat V1 "formation" backend with a rich "application" model — company details, one-or-many owners/directors with shareholding, a virtual-office add-on, per-owner KYC documents with a guarded download route, and admin review — keeping auth/email/Stripe/status reused.

**Architecture:** Runs after Phase A, so the backend lives at `backend/`. The V1 `Formation` model/routes are replaced by `Application` (richer schema, route base `/api/applications`). Pricing gains a virtual-office add-on. Documents gain an `ownerName` and a guarded file-download route. Admin endpoints move to `/api/admin/applications`. Auth, email verification, JWT/cookies, Stripe checkout/webhook, and the status state-machine are reused.

**Tech Stack:** Node 18+, Express 4, TypeScript (ESM), Mongoose 8, Stripe, Vitest + Supertest + mongodb-memory-server.

## Global Constraints

- All paths are under `backend/` (post Phase A). Language: TypeScript ESM (`.js` import specifiers).
- Entity types (exact): `SARL`, `SARL_U`, `SA`, `BRANCH`, `REP_OFFICE`.
- Statuses (exact, unchanged): `draft`, `documents_submitted`, `payment_pending`, `paid`, `in_review`, `filing_submitted`, `registered`, `needs_more_docs`, `rejected`.
- Owner role (exact): `director`, `shareholder`, `both`.
- Document types (exact): `passport`, `address_proof`, `photo`, `other`.
- Virtual-office plans (exact): `basic`, `premium`. Add-on price: `basic` +20000 cents, `premium` +50000 cents.
- Currency USD, integer cents. Roles `user`/`admin`.
- Route base is `/api/applications` (V1 `/api/formations` is removed).
- Every task ends green (`cd backend && npm test`) and is committed.

---

### Task 1: Pricing with virtual-office add-on

**Files:**
- Modify: `backend/src/lib/pricing.ts`
- Test: `backend/src/__tests__/pricing.test.ts`

**Interfaces:**
- Produces: `priceFor(entityType, tier): number` (unchanged base) and new
  `virtualOfficeAddon(plan?: 'basic'|'premium'): number`, and
  `totalPrice(entityType, tier, vo?: { wanted: boolean; plan?: 'basic'|'premium' }): number`.

- [ ] **Step 1: Write the failing test `backend/src/__tests__/pricing.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { priceFor, virtualOfficeAddon, totalPrice } from '../lib/pricing.js'

describe('pricing', () => {
  it('keeps base entity pricing', () => {
    expect(priceFor('SARL', 'standard')).toBe(49900)
    expect(priceFor('SARL', 'premium')).toBe(79900)
  })
  it('prices the virtual office add-on', () => {
    expect(virtualOfficeAddon()).toBe(0)
    expect(virtualOfficeAddon('basic')).toBe(20000)
    expect(virtualOfficeAddon('premium')).toBe(50000)
  })
  it('totals entity + tier + virtual office', () => {
    expect(totalPrice('SARL', 'standard', { wanted: true, plan: 'basic' })).toBe(69900)
    expect(totalPrice('SARL', 'standard', { wanted: false })).toBe(49900)
  })
})
```

- [ ] **Step 2: Run it — expect FAIL** (`virtualOfficeAddon`/`totalPrice` not exported)

Run: `cd backend && npm test src/__tests__/pricing.test.ts`

- [ ] **Step 3: Extend `backend/src/lib/pricing.ts`**

```ts
export type EntityType = 'SARL' | 'SARL_U' | 'SA' | 'BRANCH' | 'REP_OFFICE'
export type Tier = 'standard' | 'premium'
export type VoPlan = 'basic' | 'premium'

const BASE: Record<EntityType, number> = {
  SARL: 49900,
  SARL_U: 39900,
  SA: 99900,
  BRANCH: 79900,
  REP_OFFICE: 59900,
}

export function priceFor(entityType: EntityType, tier: Tier): number {
  const base = BASE[entityType]
  return tier === 'premium' ? base + 30000 : base
}

export function virtualOfficeAddon(plan?: VoPlan): number {
  if (plan === 'basic') return 20000
  if (plan === 'premium') return 50000
  return 0
}

export function totalPrice(
  entityType: EntityType,
  tier: Tier,
  vo?: { wanted: boolean; plan?: VoPlan },
): number {
  const addon = vo?.wanted ? virtualOfficeAddon(vo.plan) : 0
  return priceFor(entityType, tier) + addon
}
```

- [ ] **Step 4: Run it — expect PASS**

Run: `cd backend && npm test src/__tests__/pricing.test.ts`

- [ ] **Step 5: Commit**

```bash
git add backend/src/lib/pricing.ts backend/src/__tests__/pricing.test.ts
git commit -m "feat(backend): virtual-office add-on pricing"
```

---

### Task 2: User gains optional phone; Application model

**Files:**
- Modify: `backend/src/models/User.ts` (add `phone`)
- Create: `backend/src/models/Application.ts`
- Delete: `backend/src/models/Formation.ts`
- Test: `backend/src/__tests__/application.model.test.ts`

**Interfaces:**
- Produces: `User` with optional `phone: string`.
- Produces: Mongoose `Application` model with `IApplication`:
  - `userId: ObjectId`, `entityType` (enum), `packageTier` (`standard|premium`),
  - `companyDetails: { proposedName: string; alternateName?: string; businessActivity?: string; shareCapitalFCFA?: number; city: string }` (default city `"N'Djamena"`),
  - `owners: { fullName: string; role: 'director'|'shareholder'|'both'; nationality: string; ownershipPercent: number; email?: string; isPrimaryContact: boolean }[]`,
  - `virtualOffice: { wanted: boolean; plan?: 'basic'|'premium' }` (default `{ wanted: false }`),
  - `priceCents: number`, `status` (enum, default `draft`), `paymentStatus` (`unpaid|paid`),
  - `stripeSessionId?: string|null`, `statusHistory: { status; note?; at }[]`, `currentStep: number` (default 1), `createdAt: Date`.

- [ ] **Step 1: Add `phone` to `backend/src/models/User.ts`**

Add inside the schema (after `country`):
```ts
  phone: { type: String, default: '' },
```

- [ ] **Step 2: Write the failing test `backend/src/__tests__/application.model.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { Application } from '../models/Application.js'
import mongoose from 'mongoose'

describe('Application model', () => {
  it('creates with defaults and nested owners', async () => {
    const app = await Application.create({
      userId: new mongoose.Types.ObjectId(),
      entityType: 'SARL',
      packageTier: 'standard',
      companyDetails: { proposedName: 'Acme SARL' },
      owners: [
        { fullName: 'A', role: 'both', nationality: 'India', ownershipPercent: 60, isPrimaryContact: true },
        { fullName: 'B', role: 'shareholder', nationality: 'Chad', ownershipPercent: 40, isPrimaryContact: false },
      ],
      priceCents: 49900,
    })
    expect(app.status).toBe('draft')
    expect(app.currentStep).toBe(1)
    expect(app.companyDetails.city).toBe("N'Djamena")
    expect(app.virtualOffice.wanted).toBe(false)
    expect(app.owners).toHaveLength(2)
    expect(app.owners[0].role).toBe('both')
  })

  it('rejects an invalid owner role', async () => {
    await expect(
      Application.create({
        userId: new mongoose.Types.ObjectId(),
        entityType: 'SARL',
        packageTier: 'standard',
        companyDetails: { proposedName: 'X' },
        owners: [{ fullName: 'A', role: 'boss', nationality: 'IN', ownershipPercent: 100, isPrimaryContact: true }],
        priceCents: 1,
      }),
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 3: Run it — expect FAIL** (`Application` module missing)

Run: `cd backend && npm test src/__tests__/application.model.test.ts`

- [ ] **Step 4: Create `backend/src/models/Application.ts`**

```ts
import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const ownerSchema = new Schema(
  {
    fullName: { type: String, required: true },
    role: { type: String, enum: ['director', 'shareholder', 'both'], required: true },
    nationality: { type: String, required: true },
    ownershipPercent: { type: Number, required: true, min: 0, max: 100 },
    email: { type: String },
    isPrimaryContact: { type: Boolean, default: false },
  },
  { _id: false },
)

const statusEntry = new Schema(
  { status: { type: String, required: true }, note: { type: String }, at: { type: Date, default: () => new Date() } },
  { _id: false },
)

const applicationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  entityType: { type: String, enum: ['SARL', 'SARL_U', 'SA', 'BRANCH', 'REP_OFFICE'], required: true },
  packageTier: { type: String, enum: ['standard', 'premium'], default: 'standard' },
  companyDetails: {
    proposedName: { type: String, required: true },
    alternateName: { type: String },
    businessActivity: { type: String },
    shareCapitalFCFA: { type: Number },
    city: { type: String, default: "N'Djamena" },
  },
  owners: { type: [ownerSchema], default: [] },
  virtualOffice: {
    wanted: { type: Boolean, default: false },
    plan: { type: String, enum: ['basic', 'premium'] },
  },
  priceCents: { type: Number, required: true },
  status: {
    type: String,
    enum: ['draft', 'documents_submitted', 'payment_pending', 'paid', 'in_review', 'filing_submitted', 'registered', 'needs_more_docs', 'rejected'],
    default: 'draft',
  },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  stripeSessionId: { type: String, default: null },
  statusHistory: { type: [statusEntry], default: [] },
  currentStep: { type: Number, default: 1 },
  createdAt: { type: Date, default: () => new Date() },
})

export type IApplication = InferSchemaType<typeof applicationSchema>
export const Application = mongoose.model('Application', applicationSchema)
```

- [ ] **Step 5: Delete the obsolete `backend/src/models/Formation.ts`**

```bash
git rm backend/src/models/Formation.ts
```
(Its routes are replaced in Task 3; the old formation route/test files are removed there.)

- [ ] **Step 6: Run it — expect PASS** (`application.model.test.ts`)

Run: `cd backend && npm test src/__tests__/application.model.test.ts`

- [ ] **Step 7: Commit**

```bash
git add backend/src/models/User.ts backend/src/models/Application.ts backend/src/__tests__/application.model.test.ts
git rm --cached backend/src/models/Formation.ts 2>/dev/null || true
git commit -m "feat(backend): Application model (company, owners, virtual office) + user phone"
```

---

### Task 3: Application routes (create, save-step, list, detail, submit)

**Files:**
- Create: `backend/src/routes/applications.ts`
- Delete: `backend/src/routes/formations.ts`, `backend/src/__tests__/formations.routes.test.ts`
- Modify: `backend/src/app.ts` (mount `/api/applications`, remove `/api/formations`)
- Modify: `backend/src/routes/auth.ts` (signup accepts `phone`)
- Test: `backend/src/__tests__/applications.routes.test.ts`

**Interfaces:**
- Produces `pushStatus(app, status, note?)` exported from `applications.ts` (same signature as V1; reused by payments + admin).
- Routes (all `requireAuth`, scoped to `req.userId`):
  - `POST /api/applications` { entityType, packageTier } → 201 draft, `priceCents` = `totalPrice(entityType, tier, { wanted:false })`, `currentStep:1`.
  - `PATCH /api/applications/:id` { companyDetails?, owners?, virtualOffice?, currentStep? } → updates provided sections, recomputes `priceCents` via `totalPrice`, returns the app.
  - `GET /api/applications` → list mine, newest first.
  - `GET /api/applications/:id` → one of mine (404 otherwise).
  - `POST /api/applications/:id/submit` → `draft|documents_submitted` → `payment_pending` is NOT here; submit only moves `draft`→`documents_submitted` (kept for parity).

- [ ] **Step 1: Update `backend/src/routes/auth.ts` signup to accept `phone`**

In the `/signup` handler, read `phone` from body and pass to `User.create`:
```ts
const { email, password, fullName, country, phone } = req.body ?? {}
// ...
await User.create({
  email,
  passwordHash: await hashPassword(password),
  fullName,
  country,
  phone: phone ?? '',
  emailVerifyToken: hashed,
  emailVerifyExpires: expires,
})
```

- [ ] **Step 2: Write the failing test `backend/src/__tests__/applications.routes.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()

async function authedAgent() {
  await User.create({ email: 'u@x.com', passwordHash: await hashPassword('secret123'), fullName: 'U', country: 'IN', emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'u@x.com', password: 'secret123' })
  return agent
}

describe('applications routes', () => {
  it('creates a draft application priced at the entity base', async () => {
    const agent = await authedAgent()
    const res = await agent.post('/api/applications').send({ entityType: 'SARL', packageTier: 'standard' })
    expect(res.status).toBe(201)
    expect(res.body.status).toBe('draft')
    expect(res.body.priceCents).toBe(49900)
    expect(res.body.currentStep).toBe(1)
  })

  it('saves steps and recomputes price with virtual office', async () => {
    const agent = await authedAgent()
    const created = await agent.post('/api/applications').send({ entityType: 'SARL', packageTier: 'standard' })
    const id = created.body._id
    const res = await agent.patch(`/api/applications/${id}`).send({
      companyDetails: { proposedName: 'Acme SARL', businessActivity: 'Trading' },
      owners: [
        { fullName: 'A', role: 'both', nationality: 'India', ownershipPercent: 100, isPrimaryContact: true },
      ],
      virtualOffice: { wanted: true, plan: 'basic' },
      currentStep: 4,
    })
    expect(res.status).toBe(200)
    expect(res.body.companyDetails.proposedName).toBe('Acme SARL')
    expect(res.body.owners).toHaveLength(1)
    expect(res.body.virtualOffice.plan).toBe('basic')
    expect(res.body.priceCents).toBe(69900) // 49900 + 20000
    expect(res.body.currentStep).toBe(4)
  })

  it('lists and fetches my applications, 404 for others', async () => {
    const agent = await authedAgent()
    const created = await agent.post('/api/applications').send({ entityType: 'SA', packageTier: 'standard' })
    const list = await agent.get('/api/applications')
    expect(list.body).toHaveLength(1)
    const one = await agent.get(`/api/applications/${created.body._id}`)
    expect(one.status).toBe(200)
    const bad = await agent.get('/api/applications/64b000000000000000000000')
    expect(bad.status).toBe(404)
  })
})
```

- [ ] **Step 3: Run it — expect FAIL** (route missing)

Run: `cd backend && npm test src/__tests__/applications.routes.test.ts`

- [ ] **Step 4: Create `backend/src/routes/applications.ts`**

```ts
import { Router } from 'express'
import type { HydratedDocument } from 'mongoose'
import { Application, type IApplication } from '../models/Application.js'
import { totalPrice, type EntityType, type Tier, type VoPlan } from '../lib/pricing.js'
import { requireAuth } from '../middleware/auth.js'

const ENTITIES: EntityType[] = ['SARL', 'SARL_U', 'SA', 'BRANCH', 'REP_OFFICE']

export function pushStatus(app: HydratedDocument<IApplication>, status: string, note?: string): void {
  app.status = status as IApplication['status']
  app.statusHistory.push({ status, note, at: new Date() })
}

function recompute(app: HydratedDocument<IApplication>): void {
  app.priceCents = totalPrice(
    app.entityType as EntityType,
    app.packageTier as Tier,
    { wanted: app.virtualOffice?.wanted ?? false, plan: app.virtualOffice?.plan as VoPlan | undefined },
  )
}

export const applicationsRouter = Router()
applicationsRouter.use(requireAuth)

applicationsRouter.post('/', async (req, res) => {
  const { entityType, packageTier } = req.body ?? {}
  if (!ENTITIES.includes(entityType)) return res.status(400).json({ error: 'Invalid entityType' })
  const tier: Tier = packageTier === 'premium' ? 'premium' : 'standard'
  const app = await Application.create({
    userId: req.userId,
    entityType,
    packageTier: tier,
    companyDetails: { proposedName: 'Untitled' },
    priceCents: totalPrice(entityType, tier, { wanted: false }),
    statusHistory: [{ status: 'draft', at: new Date() }],
  })
  res.status(201).json(app)
})

applicationsRouter.patch('/:id', async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, userId: req.userId })
  if (!app) return res.status(404).json({ error: 'Not found' })
  const { companyDetails, owners, virtualOffice, currentStep } = req.body ?? {}
  if (companyDetails) app.companyDetails = { ...app.companyDetails, ...companyDetails }
  if (Array.isArray(owners)) app.owners = owners
  if (virtualOffice) app.virtualOffice = virtualOffice
  if (typeof currentStep === 'number') app.currentStep = currentStep
  recompute(app)
  await app.save()
  res.json(app)
})

applicationsRouter.get('/', async (req, res) => {
  const list = await Application.find({ userId: req.userId }).sort({ createdAt: -1 })
  res.json(list)
})

applicationsRouter.get('/:id', async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, userId: req.userId })
  if (!app) return res.status(404).json({ error: 'Not found' })
  res.json(app)
})

applicationsRouter.post('/:id/submit', async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, userId: req.userId })
  if (!app) return res.status(404).json({ error: 'Not found' })
  if (app.status !== 'draft') return res.status(400).json({ error: 'Not in draft' })
  pushStatus(app, 'documents_submitted')
  await app.save()
  res.json(app)
})
```

- [ ] **Step 5: Replace the mount in `backend/src/app.ts`**

Remove the `formationsRouter` import + `app.use('/api/formations', ...)` and add:
```ts
import { applicationsRouter } from './routes/applications.js'
// ...
app.use('/api/applications', applicationsRouter)
```

- [ ] **Step 6: Delete obsolete formation route + test**

```bash
git rm backend/src/routes/formations.ts backend/src/__tests__/formations.routes.test.ts
```
(Documents + payments routers, which imported from `formations.ts`, are updated in Tasks 4–5. Until then the suite for those two files will fail to import — run only the applications test in Step 7, and do the full suite after Task 5.)

- [ ] **Step 7: Run the applications test — expect PASS**

Run: `cd backend && npm test src/__tests__/applications.routes.test.ts`

- [ ] **Step 8: Commit**

```bash
git add backend/src/routes/applications.ts backend/src/app.ts backend/src/routes/auth.ts backend/src/__tests__/applications.routes.test.ts
git rm --cached backend/src/routes/formations.ts backend/src/__tests__/formations.routes.test.ts 2>/dev/null || true
git commit -m "feat(backend): application routes (create, save-step, list, detail) + phone signup"
```

---

### Task 4: Documents per-owner + guarded download

**Files:**
- Modify: `backend/src/models/Document.ts` (add `ownerName`)
- Create: `backend/src/routes/documents.ts` (rewrite for applications; nested + download)
- Modify: `backend/src/routes/applications.ts` (mount nested documents router)
- Test: `backend/src/__tests__/documents.routes.test.ts` (rewrite)

**Interfaces:**
- `Document` gains `ownerName: string` (default `''`).
- Nested under `/api/applications/:id/documents`:
  - `POST /` (multipart `file`, body `type`, `ownerName`) → 201; application must belong to user.
  - `GET /` → list for that application.
  - `GET /:docId/file` → streams the file if the requester owns the application OR is an admin (uses `requireAuth`; checks role/ownership).

- [ ] **Step 1: Add `ownerName` to `backend/src/models/Document.ts`**

Change `formationId` → `applicationId` (ref `Application`) and add `ownerName`:
```ts
import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const documentSchema = new Schema({
  applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String, default: '' },
  type: { type: String, enum: ['passport', 'address_proof', 'photo', 'other'], required: true },
  fileName: { type: String, required: true },
  storagePath: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: () => new Date() },
})

export type IDocument = InferSchemaType<typeof documentSchema>
export const DocumentModel = mongoose.model('Document', documentSchema)
```

- [ ] **Step 2: Write the failing test `backend/src/__tests__/documents.routes.test.ts`** (rewrite)

```ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()

async function setup() {
  await User.create({ email: 'd@x.com', passwordHash: await hashPassword('secret123'), fullName: 'D', country: 'IN', emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'd@x.com', password: 'secret123' })
  const a = await agent.post('/api/applications').send({ entityType: 'SARL', packageTier: 'standard' })
  return { agent, id: a.body._id as string }
}

describe('documents', () => {
  it('uploads a per-owner doc, lists it, and downloads it', async () => {
    const { agent, id } = await setup()
    const up = await agent
      .post(`/api/applications/${id}/documents`)
      .field('type', 'passport')
      .field('ownerName', 'Alice')
      .attach('file', Buffer.from('fake-pdf'), { filename: 'p.pdf', contentType: 'application/pdf' })
    expect(up.status).toBe(201)
    expect(up.body.ownerName).toBe('Alice')

    const list = await agent.get(`/api/applications/${id}/documents`)
    expect(list.body).toHaveLength(1)

    const file = await agent.get(`/api/applications/${id}/documents/${up.body._id}/file`)
    expect(file.status).toBe(200)
    expect(file.text).toBe('fake-pdf')
  })

  it('rejects download for a non-owner non-admin', async () => {
    const { id, agent } = await setup()
    const up = await agent
      .post(`/api/applications/${id}/documents`)
      .field('type', 'passport').field('ownerName', 'A')
      .attach('file', Buffer.from('x'), { filename: 'p.pdf', contentType: 'application/pdf' })
    // second user
    await User.create({ email: 'e@x.com', passwordHash: await hashPassword('secret123'), fullName: 'E', country: 'IN', emailVerified: true })
    const other = request.agent(app)
    await other.post('/api/auth/login').send({ email: 'e@x.com', password: 'secret123' })
    const res = await other.get(`/api/applications/${id}/documents/${up.body._id}/file`)
    expect(res.status).toBe(404)
  })
})
```

- [ ] **Step 3: Run it — expect FAIL**

Run: `cd backend && npm test src/__tests__/documents.routes.test.ts`

- [ ] **Step 4: Rewrite `backend/src/routes/documents.ts`**

```ts
import { Router } from 'express'
import { createReadStream } from 'node:fs'
import { Application } from '../models/Application.js'
import { DocumentModel } from '../models/Document.js'
import { upload } from '../middleware/upload.js'
import { requireAuth } from '../middleware/auth.js'

export const documentsRouter = Router({ mergeParams: true })
documentsRouter.use(requireAuth)

function appId(req: { params: Record<string, string> }) {
  return (req.params as { id: string }).id
}

documentsRouter.post('/', upload.single('file'), async (req, res) => {
  const application = await Application.findOne({ _id: appId(req), userId: req.userId })
  if (!application) return res.status(404).json({ error: 'Application not found' })
  if (!req.file) return res.status(400).json({ error: 'file required (jpg/png/webp/pdf, <=10MB)' })
  const type = ['passport', 'address_proof', 'photo', 'other'].includes(req.body?.type) ? req.body.type : 'other'
  const doc = await DocumentModel.create({
    applicationId: application._id,
    userId: req.userId,
    ownerName: req.body?.ownerName ?? '',
    type,
    fileName: req.file.originalname,
    storagePath: req.file.path,
  })
  res.status(201).json(doc)
})

documentsRouter.get('/', async (req, res) => {
  const application = await Application.findOne({ _id: appId(req), userId: req.userId })
  if (!application) return res.status(404).json({ error: 'Application not found' })
  const docs = await DocumentModel.find({ applicationId: application._id }).sort({ uploadedAt: 1 })
  res.json(docs)
})

documentsRouter.get('/:docId/file', async (req, res) => {
  const doc = await DocumentModel.findById(req.params.docId)
  if (!doc) return res.status(404).json({ error: 'Not found' })
  const isOwner = String(doc.userId) === req.userId
  const isAdmin = req.userRole === 'admin'
  if (!isOwner && !isAdmin) return res.status(404).json({ error: 'Not found' })
  res.sendFile(doc.storagePath, (err) => {
    if (err && !res.headersSent) res.status(404).json({ error: 'File missing' })
  })
}) // eslint-disable-line @typescript-eslint/no-unused-vars
```
(Note: `createReadStream` import kept for environments where `sendFile` is unavailable; if unused, remove it to satisfy lint.)

- [ ] **Step 5: Mount nested router in `backend/src/routes/applications.ts`**

At the bottom:
```ts
import { documentsRouter } from './documents.js'
applicationsRouter.use('/:id/documents', documentsRouter)
```

- [ ] **Step 6: Run the documents test — expect PASS**

Run: `cd backend && npm test src/__tests__/documents.routes.test.ts`

- [ ] **Step 7: Commit**

```bash
git add backend/src/models/Document.ts backend/src/routes/documents.ts backend/src/routes/applications.ts backend/src/__tests__/documents.routes.test.ts
git commit -m "feat(backend): per-owner documents + guarded download under applications"
```

---

### Task 5: Stripe checkout/webhook on applications

**Files:**
- Modify: `backend/src/routes/payments.ts` (Application instead of Formation)
- Modify: `backend/src/routes/applications.ts` (mount checkout nested)
- Test: `backend/src/__tests__/payments.routes.test.ts` (update)

**Interfaces:**
- `POST /api/applications/:id/checkout` (requireAuth, owns app) → creates Stripe session from `app.priceCents`, sets `status=payment_pending`, stores `stripeSessionId`, guards null url (502), returns `{url}`.
- `POST /api/webhooks/stripe` (raw body) → on `checkout.session.completed`, finds Application by `stripeSessionId`, sets `paymentStatus=paid` + `status=paid` via `pushStatus`.

- [ ] **Step 1: Update `backend/src/routes/payments.ts`**

Replace `Formation` import with `Application` and `pushStatus` import from `applications.js`; use `mergeParams` id; keep the null-url 502 guard and CLIENT_URL fallback:
```ts
import { Router, raw } from 'express'
import { Application } from '../models/Application.js'
import { getStripe } from '../lib/stripe.js'
import { requireAuth } from '../middleware/auth.js'
import { pushStatus } from './applications.js'

export const checkoutRouter = Router({ mergeParams: true })
checkoutRouter.use(requireAuth)

checkoutRouter.post('/', async (req, res) => {
  const id = (req.params as { id: string }).id
  const app = await Application.findOne({ _id: id, userId: req.userId })
  if (!app) return res.status(404).json({ error: 'Not found' })
  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `${app.entityType} formation — ${app.companyDetails.proposedName}` },
          unit_amount: app.priceCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${clientUrl}/dashboard?paid=1`,
    cancel_url: `${clientUrl}/dashboard?canceled=1`,
  })
  if (!session.url) return res.status(502).json({ error: 'No checkout URL returned by Stripe' })
  app.stripeSessionId = session.id
  pushStatus(app, 'payment_pending')
  await app.save()
  res.json({ url: session.url })
})

export const webhookRouter = Router()
webhookRouter.post('/', raw({ type: 'application/json' }), async (req, res) => {
  let event
  try {
    event = getStripe().webhooks.constructEvent(
      req.body as Buffer,
      req.headers['stripe-signature'] as string,
      process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_dummy',
    )
  } catch {
    return res.status(400).json({ error: 'Bad signature' })
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { id: string }
    const app = await Application.findOne({ stripeSessionId: session.id })
    if (app) {
      app.paymentStatus = 'paid'
      pushStatus(app, 'paid')
      await app.save()
    }
  }
  res.json({ received: true })
})
```

- [ ] **Step 2: Mount checkout nested in `backend/src/routes/applications.ts`**

```ts
import { checkoutRouter } from './payments.js'
applicationsRouter.use('/:id/checkout', checkoutRouter)
```
(The `webhookRouter` mount in `app.ts` stays as-is at `/api/webhooks/stripe`.)

- [ ] **Step 3: Update `backend/src/__tests__/payments.routes.test.ts`**

Replace `Formation` with `Application` and the create call with an application create; keep the corrected order (checkout before webhook). Full file:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { Application } from '../models/Application.js'
import { hashPassword } from '../lib/auth.js'
import { __setStripe } from '../lib/stripe.js'

const app = createApp()

beforeEach(() => {
  __setStripe({
    checkout: { sessions: { create: vi.fn(async () => ({ id: 'cs_test_123', url: 'https://stripe.test/pay' })) } },
    webhooks: { constructEvent: () => ({ type: 'checkout.session.completed', data: { object: { id: 'cs_test_123' } } }) as never },
  })
})

async function setup() {
  await User.create({ email: 'p@x.com', passwordHash: await hashPassword('secret123'), fullName: 'P', country: 'IN', emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'p@x.com', password: 'secret123' })
  const a = await agent.post('/api/applications').send({ entityType: 'SARL', packageTier: 'standard' })
  return { agent, id: a.body._id as string }
}

describe('payments', () => {
  it('creates a checkout session and sets payment_pending', async () => {
    const { agent, id } = await setup()
    const res = await agent.post(`/api/applications/${id}/checkout`)
    expect(res.status).toBe(200)
    expect(res.body.url).toBe('https://stripe.test/pay')
    const a = await Application.findById(id)
    expect(a!.status).toBe('payment_pending')
    expect(a!.stripeSessionId).toBe('cs_test_123')
  })

  it('marks paid on webhook completion', async () => {
    const { agent, id } = await setup()
    await agent.post(`/api/applications/${id}/checkout`)
    await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'sig')
      .set('Content-Type', 'application/json')
      .send(Buffer.from('{}'))
    const a = await Application.findById(id)
    expect(a!.paymentStatus).toBe('paid')
    expect(a!.status).toBe('paid')
  })
})
```

- [ ] **Step 4: Run the FULL suite — expect PASS**

Run: `cd backend && npm test`
Expected: all tests pass (pricing, application model, applications routes, documents, payments, plus the reused auth/health/db/user/seed once Task 6 updates admin/seed — if admin/seed tests still reference Formation they will fail; they are fixed in Tasks 6–7. Until then, run the specific test files: pricing, application.model, applications.routes, documents.routes, payments.routes.)

Run the targeted set:
```bash
cd backend && npm test src/__tests__/pricing.test.ts src/__tests__/application.model.test.ts src/__tests__/applications.routes.test.ts src/__tests__/documents.routes.test.ts src/__tests__/payments.routes.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/payments.ts backend/src/routes/applications.ts backend/src/__tests__/payments.routes.test.ts
git commit -m "feat(backend): stripe checkout/webhook on applications"
```

---

### Task 6: Admin routes on applications

**Files:**
- Modify: `backend/src/routes/admin.ts` (Application; full populate)
- Test: `backend/src/__tests__/admin.routes.test.ts` (update)

**Interfaces:**
- `GET /api/admin/applications?status=` → all applications (optional filter), newest first, `.populate('userId','email fullName')`; owners + virtualOffice are embedded so they come automatically.
- `PATCH /api/admin/applications/:id/status` { status, note? } → admin statuses only, via `pushStatus`.
- `PATCH /api/admin/documents/:id` { status } → `approved|rejected`.

- [ ] **Step 1: Update `backend/src/routes/admin.ts`**

```ts
import { Router } from 'express'
import { Application } from '../models/Application.js'
import { DocumentModel } from '../models/Document.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { pushStatus } from './applications.js'

const ADMIN_STATUSES = ['in_review', 'filing_submitted', 'registered', 'needs_more_docs', 'rejected']

export const adminRouter = Router()
adminRouter.use(requireAuth, requireAdmin)

adminRouter.get('/applications', async (req, res) => {
  const filter = req.query.status ? { status: String(req.query.status) } : {}
  const list = await Application.find(filter).sort({ createdAt: -1 }).populate('userId', 'email fullName')
  res.json(list)
})

adminRouter.patch('/applications/:id/status', async (req, res) => {
  const { status, note } = req.body ?? {}
  if (!ADMIN_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid admin status' })
  const app = await Application.findById(req.params.id)
  if (!app) return res.status(404).json({ error: 'Not found' })
  pushStatus(app, status, note)
  await app.save()
  res.json(app)
})

adminRouter.patch('/documents/:id', async (req, res) => {
  const { status } = req.body ?? {}
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' })
  const doc = await DocumentModel.findByIdAndUpdate(req.params.id, { status }, { new: true })
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
})
```

- [ ] **Step 2: Update `backend/src/__tests__/admin.routes.test.ts`**

Replace `Formation`→`Application`, `/api/formations`→`/api/applications`, `/api/admin/formations`→`/api/admin/applications`. Full file:

```ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { Application } from '../models/Application.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()

async function makeUser(role: 'user' | 'admin', email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('admin routes', () => {
  it('forbids non-admins', async () => {
    const agent = await makeUser('user', 'u@x.com')
    expect((await agent.get('/api/admin/applications')).status).toBe(403)
  })

  it('lists applications and advances status', async () => {
    const user = await makeUser('user', 'u@x.com')
    const created = await user.post('/api/applications').send({ entityType: 'SARL', packageTier: 'standard' })
    const admin = await makeUser('admin', 'admin@x.com')
    const list = await admin.get('/api/admin/applications')
    expect(list.status).toBe(200)
    expect(list.body.length).toBe(1)
    const patched = await admin.patch(`/api/admin/applications/${created.body._id}/status`).send({ status: 'registered', note: 'done' })
    expect(patched.status).toBe(200)
    expect(patched.body.status).toBe('registered')
    const a = await Application.findById(created.body._id)
    expect(a!.statusHistory.at(-1)!.note).toBe('done')
  })
})
```

- [ ] **Step 3: Run admin test — expect PASS**

Run: `cd backend && npm test src/__tests__/admin.routes.test.ts`

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/admin.ts backend/src/__tests__/admin.routes.test.ts
git commit -m "feat(backend): admin routes on applications"
```

---

### Task 7: Rich demo seed + full green

**Files:**
- Modify: `backend/src/seed.ts` (rich applications)
- Test: `backend/src/__tests__/seed.test.ts` (update)

**Interfaces:**
- `seedDemo()` wipes Users + Applications, creates 1 admin + 2 users, each with applications containing multi-owner arrays, a virtual office choice, and varied statuses.

- [ ] **Step 1: Rewrite `backend/src/seed.ts`**

```ts
import 'dotenv/config'
import { connectDb, disconnectDb } from './lib/db.js'
import { User } from './models/User.js'
import { Application } from './models/Application.js'
import { hashPassword } from './lib/auth.js'
import { totalPrice } from './lib/pricing.js'

export async function seedDemo(): Promise<void> {
  await User.deleteMany({})
  await Application.deleteMany({})

  const admin = await User.create({
    email: 'admin@chad.demo', passwordHash: await hashPassword('Admin@123'),
    fullName: 'Demo Admin', country: 'Chad', role: 'admin', emailVerified: true,
  })
  const user = await User.create({
    email: 'user@chad.demo', passwordHash: await hashPassword('User@123'),
    fullName: 'Demo User', country: 'India', role: 'user', emailVerified: true, phone: '+91 90000 00000',
  })

  const specs = [
    {
      entityType: 'SARL' as const, name: 'Sahel Trading SARL', status: 'registered',
      owners: [
        { fullName: 'Amadou Diallo', role: 'both' as const, nationality: 'Chad', ownershipPercent: 60, isPrimaryContact: true },
        { fullName: 'Rajesh Kumar', role: 'shareholder' as const, nationality: 'India', ownershipPercent: 40, isPrimaryContact: false },
      ],
      vo: { wanted: true, plan: 'premium' as const },
    },
    {
      entityType: 'SA' as const, name: "N'Djamena Holdings SA", status: 'in_review',
      owners: [
        { fullName: 'Fatima Hassan', role: 'director' as const, nationality: 'Chad', ownershipPercent: 100, isPrimaryContact: true },
      ],
      vo: { wanted: true, plan: 'basic' as const },
    },
    {
      entityType: 'SARL' as const, name: 'Draft Co SARL', status: 'draft',
      owners: [], vo: { wanted: false as const },
    },
  ]

  for (const s of specs) {
    await Application.create({
      userId: user._id,
      entityType: s.entityType,
      packageTier: 'standard',
      companyDetails: { proposedName: s.name, businessActivity: 'General trading', shareCapitalFCFA: 1000000, city: "N'Djamena" },
      owners: s.owners,
      virtualOffice: s.vo,
      priceCents: totalPrice(s.entityType, 'standard', s.vo),
      status: s.status,
      paymentStatus: s.status === 'registered' || s.status === 'in_review' ? 'paid' : 'unpaid',
      currentStep: s.status === 'draft' ? 2 : 7,
      statusHistory: [{ status: s.status, at: new Date() }],
    })
  }
  console.log('Seeded:', { admin: admin.email, user: user.email, applications: specs.length })
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  connectDb(process.env.MONGODB_URI!).then(seedDemo).then(disconnectDb).then(() => process.exit(0))
    .catch((e) => { console.error(e); process.exit(1) })
}
```

- [ ] **Step 2: Update `backend/src/__tests__/seed.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { seedDemo } from '../seed.js'
import { User } from '../models/User.js'
import { Application } from '../models/Application.js'

describe('seedDemo', () => {
  it('creates admin, user and rich applications', async () => {
    await seedDemo()
    expect(await User.countDocuments({ role: 'admin' })).toBe(1)
    expect(await Application.countDocuments()).toBe(3)
    const registered = await Application.findOne({ status: 'registered' })
    expect(registered!.owners.length).toBe(2)
    expect(registered!.virtualOffice.wanted).toBe(true)
  })
})
```

- [ ] **Step 3: Run the FULL backend suite + typecheck — expect ALL green**

Run: `cd backend && npm test && npm run typecheck`
Expected: every test passes; no type errors. (If any obsolete reference to `Formation` remains anywhere, fix it now.)

- [ ] **Step 4: Commit**

```bash
git add backend/src/seed.ts backend/src/__tests__/seed.test.ts
git commit -m "feat(backend): rich multi-owner demo seed; full suite green"
```

---

## Self-Review Notes (coverage vs spec §6–§9, §11)

- Virtual-office add-on pricing → Task 1. ✅
- Application model: company details, owners[], virtualOffice, currentStep → Task 2. ✅
- User phone → Task 2/3. ✅
- Create + save-step (recompute price) + list/detail + submit → Task 3. ✅
- Per-owner documents + guarded download → Task 4. ✅
- Stripe on applications (null-url guard kept) → Task 5. ✅
- Admin on applications (populated) → Task 6. ✅
- Rich multi-owner seed → Task 7. ✅
- Route base renamed formations→applications; Formation model/routes removed → Tasks 2,3. ✅
