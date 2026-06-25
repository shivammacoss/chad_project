# Phase 9 — Multi-Country Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Country registry + country-scoped services + a country selector + country on orders.

**Architecture:** A `Country` collection, a `country` field on `Service` + `Application`, country-aware `listServices`, and a frontend country selector that filters the catalog. Service keys stay globally unique; country tags/filters them.

**Tech Stack:** Express + TS + MongoDB (`backend/`), Vite/React + TS (`frontend/`), Vitest.

## Global Constraints

- Backend under `backend/`, frontend under `frontend/`. TS ESM / TSX.
- Country codes: `TD` (default), `AE`, `KE`. Existing data + services default to `TD`.
- Builds on the Phase 7b DB catalog. Each task ends green and is committed.

---

### Task 1: Country registry + country-scoped services + order country (backend)

**Files:**
- Create: `backend/src/models/Country.ts`
- Create: `backend/src/routes/countries.ts`
- Modify: `backend/src/app.ts` (mount `/api/countries`)
- Modify: `backend/src/models/Service.ts` (`country`)
- Modify: `backend/src/models/Application.ts` (`country`)
- Modify: `backend/src/lib/services.ts` (add example AE/KE services + `country` on ServiceDef)
- Modify: `backend/src/lib/serviceStore.ts` (country filter + seed countries)
- Modify: `backend/src/routes/services.ts` (`?country=`)
- Modify: `backend/src/routes/applications.ts` (set `app.country`)
- Modify: `backend/src/routes/admin.ts` (country in CRUD)
- Modify: `backend/src/seed.ts` (countries)
- Test: `backend/src/__tests__/country.test.ts`

**Interfaces:**
- `Country`: `code` (unique), `name`, `flag`, `active` (default true).
- `ServiceDef` gains optional `country?: string`. `Service` model + admin CRUD include `country` (default `TD`).
- `listServices(activeOnly=true, country?)` filters by `country` when provided (omit → all; the route defaults to `TD`).
- `seedCountriesIfEmpty()` seeds TD/AE/KE; `GET /api/countries` returns active.
- Order create sets `app.country = service.country ?? 'TD'`.

- [ ] **Step 1: Create `backend/src/models/Country.ts`**
```ts
import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const countrySchema = new Schema({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  flag: { type: String, default: '' },
  active: { type: Boolean, default: true },
})

export type ICountry = InferSchemaType<typeof countrySchema>
export const Country = mongoose.model('Country', countrySchema)
```

- [ ] **Step 2: `Service.ts`** — add `country: { type: String, default: 'TD', index: true },`. `Application.ts` — add `country: { type: String, default: 'TD' },`.

- [ ] **Step 3: `services.ts`** — add `country?: string` to `ServiceDef`; tag NONE explicitly (default TD applied at seed). Append two example services to `SERVICES`:
```ts
  {
    key: 'uae-company-formation', category: 'Company Formation', name: 'UAE Company Formation',
    blurb: 'Set up a company in the UAE (example multi-country service).',
    priceCents: 120000, flow: 'generic', country: 'AE',
    intakeFields: [{ name: 'companyName', label: 'Proposed company name', type: 'text', required: true }],
    requiredDocuments: ['passport'],
  },
  {
    key: 'kenya-company-formation', category: 'Company Formation', name: 'Kenya Company Formation',
    blurb: 'Register a company in Kenya (example multi-country service).',
    priceCents: 60000, flow: 'generic', country: 'KE',
    intakeFields: [{ name: 'companyName', label: 'Proposed company name', type: 'text', required: true }],
    requiredDocuments: ['passport'],
  },
```
(Existing entries get `country: 'TD'` via the model default when seeded; the `toDef` mapper in serviceStore should include `country`.)

- [ ] **Step 4: `serviceStore.ts`** — include `country` in `toDef`; add country filter + `seedCountriesIfEmpty`:
```ts
import { Country } from '../models/Country.js'
// in toDef return, add: country: (doc as { country?: string }).country ?? 'TD',
// seedServicesIfEmpty insertMany: ensure each gets country (s.country ?? 'TD')

export async function seedCountriesIfEmpty(): Promise<void> {
  if ((await Country.countDocuments({})) === 0) {
    await Country.insertMany([
      { code: 'TD', name: 'Chad', flag: '🇹🇩', active: true },
      { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', active: true },
      { code: 'KE', name: 'Kenya', flag: '🇰🇪', active: true },
    ])
  }
}

export async function listServices(activeOnly = true, country?: string): Promise<ServiceDef[]> {
  await seedServicesIfEmpty()
  const filter: Record<string, unknown> = activeOnly ? { active: true } : {}
  if (country && country !== 'all') filter.country = country
  const docs = await Service.find(filter).sort({ category: 1, name: 1 })
  return docs.map((d) => toDef(d as never))
}
```
Update `seedServicesIfEmpty` insertMany to set `country: s.country ?? 'TD'`. `ServiceDef` type now has `country?`.

- [ ] **Step 5: Create `backend/src/routes/countries.ts`**
```ts
import { Router } from 'express'
import { Country } from '../models/Country.js'
import { seedCountriesIfEmpty } from '../lib/serviceStore.js'

export const countriesRouter = Router()
countriesRouter.get('/', async (_req, res) => {
  await seedCountriesIfEmpty()
  res.json(await Country.find({ active: true }).sort({ name: 1 }))
})
```

- [ ] **Step 6: `app.ts`** — mount: `import { countriesRouter } from './routes/countries.js'` + `app.use('/api/countries', countriesRouter)`.

- [ ] **Step 7: `services.ts` route** — accept `?country`:
```ts
servicesRouter.get('/', async (req, res) => {
  const country = req.query.country ? String(req.query.country) : 'TD'
  try { res.json(await listServices(true, country)) } catch { res.json(SERVICES) }
})
```

- [ ] **Step 8: `applications.ts` POST** — set country from the service. After `const service = await getServiceDef(serviceKey)` and in BOTH create() calls add `country: service.country ?? 'TD'`.

- [ ] **Step 9: `admin.ts`** — include `country` in service create + patch allowed fields (add `'country'` to the PATCH allow-list; in POST add `country: req.body.country ?? 'TD'`).

- [ ] **Step 10: `index.ts` + `seed.ts`** — call `seedCountriesIfEmpty()` alongside `seedServicesIfEmpty()` (boot + seed).

- [ ] **Step 11: Write the failing test `backend/src/__tests__/country.test.ts`**
```ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()
async function authed(email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: 'U', country: 'IN', emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('multi-country', () => {
  it('lists countries', async () => {
    const res = await request(app).get('/api/countries')
    const codes = res.body.map((c: { code: string }) => c.code)
    expect(codes).toContain('TD'); expect(codes).toContain('AE'); expect(codes).toContain('KE')
  })
  it('filters services by country', async () => {
    const ae = await request(app).get('/api/services?country=AE')
    expect(ae.body.every((s: { country: string }) => s.country === 'AE')).toBe(true)
    expect(ae.body.find((s: { key: string }) => s.key === 'uae-company-formation')).toBeTruthy()
    const td = await request(app).get('/api/services?country=TD')
    expect(td.body.find((s: { key: string }) => s.key === 'company-formation')).toBeTruthy()
  })
  it('sets application.country from the service', async () => {
    const agent = await authed('c@x.com')
    const order = await agent.post('/api/applications').send({ serviceKey: 'uae-company-formation' })
    expect(order.body.country).toBe('AE')
  })
})
```

- [ ] **Step 12: Run it + full suite — expect PASS**

Run: `cd backend && npm test src/__tests__/country.test.ts` then `cd backend && npm test && npm run typecheck`

- [ ] **Step 13: Commit**
```bash
git add backend/src
git commit -m "feat(backend): country registry + country-scoped services + order country"
```

---

### Task 2: Country selector + display (frontend)

**Files:**
- Modify: `frontend/src/types/app.ts` (`Country`; `Application.country?`; `AdminService.country`)
- Create: `frontend/src/lib/countries.ts` (fetch)
- Modify: `frontend/src/pages/GetStartedPage.tsx` (country selector → filter catalog)
- Modify: `frontend/src/pages/StartServicePage.tsx` (country selector → filter catalog)
- Modify: `frontend/src/pages/ApplicationDetailPage.tsx` + `AdminPage.tsx` (show country)
- Modify: `frontend/src/components/staff/ServicesPanel.tsx` (show/set country)
- Test: `frontend/src/pages/__tests__/get-started.test.tsx` (update for country fetch)

**Interfaces:**
- `Country { _id?: string; code: string; name: string; flag: string }`.
- `fetchCountries(): Promise<Country[]>` from `lib/countries.ts` (GET /api/countries, fallback `[{code:'TD',name:'Chad',flag:'🇹🇩'}]`).
- GetStarted + StartService: a country `<select>` (default `TD`); on change refetch `GET /api/services?country=<code>`.

- [ ] **Step 1: `types/app.ts`** — add `export interface Country { _id?: string; code: string; name: string; flag: string }`; add `country?: string` to `Application`; add `country?: string` to `AdminService`.

- [ ] **Step 2: Create `frontend/src/lib/countries.ts`**
```ts
import { apiGet } from '@/lib/api'
import type { Country } from '@/types/app'

export function fetchCountries(): Promise<Country[]> {
  return apiGet<Country[]>('/api/countries').catch(() => [{ code: 'TD', name: 'Chad', flag: '🇹🇩' }])
}
```

- [ ] **Step 3: `GetStartedPage.tsx`** — add a country selector that drives the service fetch. Add state `const [country, setCountry] = useState('TD')` and `const [countries, setCountries] = useState<Country[]>([])`. On mount fetch countries. Change the services effect to fetch `fetchServices(country)` — update `fetchServices` to accept a country param:
  - In `frontend/src/lib/services.ts`, change `fetchServices()` to `fetchServices(country = 'TD')` → `apiGet<ServiceDef[]>(\`/api/services?country=${country}\`)`.
  - In GetStarted, refetch services when `country` changes; render a `<select>` of countries (flag + name) above the catalog, bound to `setCountry`.

- [ ] **Step 4: `StartServicePage.tsx`** — same country selector + `fetchServices(country)` refetch on change.

- [ ] **Step 5: Display country** — in `ApplicationDetailPage.tsx` header and `AdminPage.tsx` rows, show `a.country` when present (e.g., a small badge). In `ServicesPanel.tsx`, show `s.country` in each row and add a country `<input>`/text to the Add form (default `TD`) passed to the POST body.

- [ ] **Step 6: Update `get-started.test.tsx`** — the page now also fetches `/api/countries`; add it to the mock (return `[{code:'TD',name:'Chad',flag:'🇹🇩'}]`) and keep the existing assertions (services list + signup). Ensure the services mock matches `/api/services` (with or without query).

- [ ] **Step 7: Run affected tests + build**

Run: `cd frontend && npm test src/pages/__tests__/get-started.test.tsx` then `cd frontend && npm test && npm run build`

- [ ] **Step 8: Commit**
```bash
git add frontend/src
git commit -m "feat(web): country selector + country display"
```

---

### Task 3: Full green + verification

- [ ] **Step 1: Full gates**

Run:
```bash
cd backend && npm test && npm run typecheck
cd frontend && npm test && npm run build && npm run lint
```
Expected: all pass, typecheck clean, build clean, 0 lint warnings. Fix any breakage minimally (the `fetchServices(country)` signature change is the main frontend risk — update all call sites: GetStarted, StartServicePage).

- [ ] **Step 2: Commit (only if fixes were needed)**
```bash
git add -A
git commit -m "chore: phase 9 green"
```

---

## Self-Review Notes (coverage vs design §2–§4)

- Country model + GET /api/countries → Task 1. ✅
- Service.country + Application.country → Task 1. ✅
- country-filtered catalog → Task 1. ✅
- order country from service → Task 1. ✅
- admin CRUD country → Task 1. ✅
- country selector (GetStarted + StartService) → Task 2. ✅
- country display (detail/admin/services) → Task 2. ✅
- example AE/KE services → Task 1. ✅
