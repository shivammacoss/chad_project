# Phase 4 — Certificates & Document Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a real Certificate of Incorporation PDF on issuance, assign a registration number, and let customers download/print it.

**Architecture:** Backend adds `pdfkit` certificate generation, `companyRegNo`/`registeredAt` on Application, a staff `issue-certificate` endpoint, and an owner/staff `certificate.pdf` download endpoint (regenerated on the fly). Frontend adds an "Issue certificate" action in staff panels and a Certificates section (reg number + download) for customers.

**Tech Stack:** Express + TS + MongoDB (`backend/`), `pdfkit`, Vite/React + TS (`frontend/`), Vitest.

## Global Constraints

- Backend under `backend/`, frontend under `frontend/`. TS ESM / TSX.
- Registration number format: `RCCM/NDJ/<year>/B-<seq4>` (seq zero-padded to 4).
- Certificates are written to `uploads/<appId>/certificate.pdf`. The download endpoint regenerates from current data.
- Only the Certificate of Incorporation is generated; agent-uploaded official docs (Phase 3) are unchanged.
- Each task ends green and is committed. Backend: `cd backend && npm test`. Frontend: `cd frontend && npm test`.

---

### Task 1: Certificate generation lib + model fields (backend)

**Files:**
- Modify: `backend/package.json` (add `pdfkit` + `@types/pdfkit`)
- Modify: `backend/src/models/Application.ts` (`companyRegNo`, `registeredAt`)
- Create: `backend/src/lib/certificate.ts`
- Test: `backend/src/__tests__/certificate.test.ts`

**Interfaces:**
- `Application` adds `companyRegNo: { type: String, default: null }`, `registeredAt: { type: Date, default: null }`.
- `generateCertificatePdf(app, applicantName): Promise<Buffer>` from `certificate.ts` — returns a PDF buffer (starts with `%PDF`).

- [ ] **Step 1: Add deps to `backend/package.json`**

Add to `dependencies`: `"pdfkit": "^0.15.0"`. Add to `devDependencies`: `"@types/pdfkit": "^0.13.4"`. Then run `cd backend && npm install`.

- [ ] **Step 2: Add fields to `backend/src/models/Application.ts`**

After `stripeSessionId`:
```ts
  companyRegNo: { type: String, default: null },
  registeredAt: { type: Date, default: null },
```

- [ ] **Step 3: Create `backend/src/lib/certificate.ts`**

```ts
import PDFDocument from 'pdfkit'
import type { IApplication } from '../models/Application.js'

type AppLike = IApplication & { companyRegNo?: string | null; registeredAt?: Date | null }

export function generateCertificatePdf(app: AppLike, applicantName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const cd = app.companyDetails ?? ({} as NonNullable<AppLike['companyDetails']>)
    const regNo = app.companyRegNo ?? '—'
    const issued = app.registeredAt ? new Date(app.registeredAt) : new Date()

    doc.fontSize(10).fillColor('#555').text('REPUBLIC OF CHAD', { align: 'center' })
    doc.moveDown(0.2).fontSize(9).fillColor('#888').text('Chad Business Assist — Online Incorporation Platform', { align: 'center' })
    doc.moveDown(1.2)
    doc.fontSize(22).fillColor('#0B1220').text('Certificate of Incorporation', { align: 'center' })
    doc.moveDown(0.3).fontSize(11).fillColor('#444').text('OHADA — SARL / SA / Branch / Representative Office', { align: 'center' })
    doc.moveDown(1.5)

    doc.fontSize(12).fillColor('#0B1220')
    doc.text('This is to certify that the company named below has been duly registered:', { align: 'left' })
    doc.moveDown(1)

    const row = (label: string, value: string) => {
      doc.fontSize(11).fillColor('#666').text(label, { continued: true }).fillColor('#0B1220').text('  ' + value)
      doc.moveDown(0.4)
    }
    row('Company name:', cd.proposedName ?? '—')
    row('Entity type:', String(app.entityType ?? '—'))
    row('Registration number:', regNo)
    row('Date of incorporation:', issued.toISOString().slice(0, 10))
    row('Registered office:', cd.city ?? "N'Djamena")
    row('Business activity:', cd.businessActivity ?? '—')
    row('Share capital:', `${(cd.shareCapitalFCFA ?? 0).toLocaleString()} ${cd.currency ?? 'FCFA'} (paid-up ${(cd.paidUpCapitalFCFA ?? 0).toLocaleString()})`)
    row('Applicant:', applicantName)

    const shareholders = (app.owners ?? []).filter((o) => o.role === 'shareholder' || o.role === 'both')
    const directors = (app.owners ?? []).filter((o) => o.role === 'director' || o.role === 'both')
    doc.moveDown(0.6).fontSize(11).fillColor('#666').text('Shareholders:')
    if (shareholders.length === 0) doc.fillColor('#0B1220').text('  —')
    shareholders.forEach((s) => doc.fillColor('#0B1220').text(`  • ${s.fullName} (${s.nationality}) — ${s.ownershipPercent ?? 0}%`))
    doc.moveDown(0.4).fontSize(11).fillColor('#666').text('Directors:')
    if (directors.length === 0) doc.fillColor('#0B1220').text('  —')
    directors.forEach((d) => doc.fillColor('#0B1220').text(`  • ${d.fullName} (${d.nationality})`))

    doc.moveDown(2)
    doc.fontSize(10).fillColor('#888').text(`Issued on ${issued.toISOString().slice(0, 10)} via Chad Business Assist. This document is computer-generated.`, { align: 'center' })

    doc.end()
  })
}
```

- [ ] **Step 4: Write the failing test `backend/src/__tests__/certificate.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { generateCertificatePdf } from '../lib/certificate.js'

describe('generateCertificatePdf', () => {
  it('produces a non-empty PDF buffer', async () => {
    const app = {
      entityType: 'SARL', companyRegNo: 'RCCM/NDJ/2026/B-0001',
      companyDetails: { proposedName: 'Acme SARL', city: "N'Djamena", businessActivity: 'Trading', shareCapitalFCFA: 1000000, paidUpCapitalFCFA: 500000, currency: 'FCFA' },
      owners: [{ fullName: 'A', role: 'shareholder', nationality: 'IN', ownershipPercent: 100 }, { fullName: 'B', role: 'director', nationality: 'Chad' }],
    } as never
    const buf = await generateCertificatePdf(app, 'Jo Customer')
    expect(buf.length).toBeGreaterThan(500)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
  })
})
```

- [ ] **Step 5: Run it — expect PASS**

Run: `cd backend && npm test src/__tests__/certificate.test.ts` then `cd backend && npm test && npm run typecheck`

- [ ] **Step 6: Commit**
```bash
git add backend/package.json backend/package-lock.json backend/src/models/Application.ts backend/src/lib/certificate.ts backend/src/__tests__/certificate.test.ts
git commit -m "feat(backend): certificate PDF generation + regNo/registeredAt fields"
```

---

### Task 2: Issue + download certificate endpoints (backend)

**Files:**
- Modify: `backend/src/routes/staff.ts` (issue-certificate)
- Modify: `backend/src/routes/applications.ts` (certificate.pdf download)
- Test: `backend/src/__tests__/certificate.routes.test.ts`

**Interfaces:**
- `POST /api/staff/applications/:id/issue-certificate` (`requireStaff`) — assign `companyRegNo` if absent (`RCCM/NDJ/<year>/B-<seq4>`, seq = registered count + 1), set `registeredAt = now`, `pushStatus(app,'registered')`, generate the PDF, write to `uploads/<appId>/certificate.pdf`, upsert a `Document` (type `certificate`, status `approved`, storagePath that file). Returns the app.
- `GET /api/applications/:id/certificate.pdf` (`requireAuth`, owner-or-staff) — 404 if no `companyRegNo`; else regenerate the PDF from current data and stream with `Content-Type: application/pdf`.

- [ ] **Step 1: Add the issue route to `backend/src/routes/staff.ts`**

Add imports at top:
```ts
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { generateCertificatePdf } from '../lib/certificate.js'
```
Add route (before the `export`-ending of the file, after the other routes):
```ts
staffRouter.post('/applications/:id/issue-certificate', async (req, res) => {
  const app = await Application.findById(req.params.id).populate('userId', 'fullName email')
  if (!app) return res.status(404).json({ error: 'Not found' })
  if (!app.companyRegNo) {
    const seq = (await Application.countDocuments({ companyRegNo: { $ne: null } })) + 1
    app.companyRegNo = `RCCM/NDJ/${new Date().getFullYear()}/B-${String(seq).padStart(4, '0')}`
  }
  app.registeredAt = new Date()
  pushStatus(app, 'registered', `Certificate issued (${app.companyRegNo})`)
  await app.save()

  const applicantName = (app.userId as unknown as { fullName?: string })?.fullName ?? 'Applicant'
  const pdf = await generateCertificatePdf(app as never, applicantName)
  const dir = join(process.cwd(), 'uploads', String(app._id))
  mkdirSync(dir, { recursive: true })
  const filePath = join(dir, 'certificate.pdf')
  writeFileSync(filePath, pdf)

  const existing = await DocumentModel.findOne({ applicationId: app._id, type: 'certificate', fileName: 'certificate-of-incorporation.pdf' })
  if (existing) { existing.storagePath = filePath; existing.status = 'approved'; await existing.save() }
  else {
    await DocumentModel.create({ applicationId: app._id, userId: app.userId, ownerName: '', type: 'certificate', fileName: 'certificate-of-incorporation.pdf', storagePath: filePath, status: 'approved' })
  }
  res.json(app)
})
```

- [ ] **Step 2: Add the download route to `backend/src/routes/applications.ts`**

Add imports if missing:
```ts
import { User } from '../models/User.js'
import { generateCertificatePdf } from '../lib/certificate.js'
```
Add BEFORE the `applicationsRouter.use('/:id/documents', ...)` nested mounts (so `/:id/certificate.pdf` matches first), and after `requireAuth` is applied at router level:
```ts
applicationsRouter.get('/:id/certificate.pdf', async (req, res) => {
  const app = await Application.findById(req.params.id)
  if (!app) return res.status(404).json({ error: 'Not found' })
  const isOwner = String(app.userId) === req.userId
  const isStaff = req.userRole && !['customer', 'user'].includes(req.userRole)
  if (!isOwner && !isStaff) return res.status(404).json({ error: 'Not found' })
  if (!app.companyRegNo) return res.status(404).json({ error: 'Certificate not issued yet' })
  const user = await User.findById(app.userId).select('fullName')
  const pdf = await generateCertificatePdf(app as never, user?.fullName ?? 'Applicant')
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'inline; filename="certificate-of-incorporation.pdf"')
  res.send(pdf)
})
```
Note: the router-level `requireAuth` already runs (applicationsRouter.use(requireAuth)); this route is owner-or-staff.

- [ ] **Step 3: Write the failing test `backend/src/__tests__/certificate.routes.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { Application } from '../models/Application.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()
async function loginAs(role: string, email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role + ' user', country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('certificate endpoints', () => {
  it('issues a certificate and downloads the PDF', async () => {
    const customer = await loginAs('customer', 'c@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const id = created.body._id

    const before = await customer.get(`/api/applications/${id}/certificate.pdf`)
    expect(before.status).toBe(404) // not issued yet

    const legal = await loginAs('legal', 'l@x.com')
    const issued = await legal.post(`/api/staff/applications/${id}/issue-certificate`)
    expect(issued.status).toBe(200)
    expect(issued.body.companyRegNo).toMatch(/^RCCM\/NDJ\/\d{4}\/B-\d{4}$/)
    expect(issued.body.registeredAt).toBeTruthy()

    const certDocs = await legal.get(`/api/staff/applications/${id}/documents`)
    expect(certDocs.body.some((d: { type: string }) => d.type === 'certificate')).toBe(true)

    const pdf = await customer.get(`/api/applications/${id}/certificate.pdf`)
    expect(pdf.status).toBe(200)
    expect(pdf.headers['content-type']).toContain('application/pdf')

    const app2 = await Application.findById(id)
    expect(app2!.status).toBe('registered')
  })

  it('blocks a non-owner non-staff from downloading', async () => {
    const customer = await loginAs('customer', 'owner@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const legal = await loginAs('legal', 'l2@x.com')
    await legal.post(`/api/staff/applications/${created.body._id}/issue-certificate`)
    const other = await loginAs('customer', 'other@x.com')
    const res = await other.get(`/api/applications/${created.body._id}/certificate.pdf`)
    expect(res.status).toBe(404)
  })
})
```

- [ ] **Step 4: Run it — expect PASS**

Run: `cd backend && npm test src/__tests__/certificate.routes.test.ts` then `cd backend && npm test && npm run typecheck`

- [ ] **Step 5: Commit**
```bash
git add backend/src/routes/staff.ts backend/src/routes/applications.ts backend/src/__tests__/certificate.routes.test.ts
git commit -m "feat(backend): issue-certificate + certificate.pdf download endpoints"
```

---

### Task 3: Staff "Issue certificate" + types (frontend)

**Files:**
- Modify: `frontend/src/types/app.ts` (`companyRegNo?`, `registeredAt?`)
- Modify: `frontend/src/components/staff/LegalPanel.tsx` (Issue certificate button)
- Modify: `frontend/src/components/staff/AgentPanel.tsx` (Issue certificate button)
- Test: `frontend/src/components/staff/__tests__/legal-panel.test.tsx` (keep green; optionally assert button)

**Interfaces:**
- `Application` type gains `companyRegNo?: string | null; registeredAt?: string | null`.
- Both panels: when an application is open, show an **"Issue certificate"** button → `apiPost('/api/staff/applications/:id/issue-certificate')` then refetch (`open(id)` + list reload). When `sel.companyRegNo` is set, show the reg number instead of (or above) the button.

- [ ] **Step 1: `frontend/src/types/app.ts`** — add to `Application`:
```ts
  companyRegNo?: string | null
  registeredAt?: string | null
```

- [ ] **Step 2: `LegalPanel.tsx`** — add an `issueCert` handler and a button in the open-application pane:
```tsx
import { apiGet, apiPatch, apiPost } from '@/lib/api' // ensure apiPost imported
// inside component:
async function issueCert() { if (!sel) return; await apiPost(`/api/staff/applications/${sel._id}/issue-certificate`); await open(sel._id); await load() }
```
In the detail pane (near "Advance status"), add:
```tsx
<div>
  <p className="text-sm uppercase tracking-wider text-frost/50">Certificate</p>
  {sel.companyRegNo
    ? <p className="mt-1 text-sm text-teal-electric">Issued · {sel.companyRegNo}</p>
    : <Button size="sm" className="mt-2" onClick={issueCert}>Issue certificate</Button>}
</div>
```

- [ ] **Step 3: `AgentPanel.tsx`** — same `issueCert` handler + the same Certificate block in its open-case pane (import `apiPost`).

- [ ] **Step 4: Run the staff tests — expect PASS**

Run: `cd frontend && npm test src/components/staff/__tests__/legal-panel.test.tsx` (the existing mock returns no companyRegNo, so the "Issue certificate" button renders; the test still passes as it only checks the documents render). Then `cd frontend && npm test`.

- [ ] **Step 5: Commit**
```bash
git add frontend/src/types/app.ts frontend/src/components/staff/LegalPanel.tsx frontend/src/components/staff/AgentPanel.tsx
git commit -m "feat(web): staff Issue certificate action + regNo display"
```

---

### Task 4: Customer Certificates section + full green (frontend)

**Files:**
- Modify: `frontend/src/pages/ApplicationDetailPage.tsx`
- Modify: `frontend/src/pages/DashboardPage.tsx` (optional: show regNo)
- Test: full suites + build.

**Interfaces:**
- Detail page: when `a.companyRegNo` is set, show a **Certificates** block with the registration number and a **Download / Print certificate** link to `/api/applications/:id/certificate.pdf` (target `_blank`). Keep the existing official-documents (certificate/government_receipt/license) list.

- [ ] **Step 1: `ApplicationDetailPage.tsx`** — show regNo in the header when present:
```tsx
{a.companyRegNo && <p className="text-sm text-teal-electric">Reg no: {a.companyRegNo}</p>}
```
And add a Certificates block (place it before or near the existing official-documents section):
```tsx
{a.companyRegNo && (
  <>
    <h2 className="mt-8 text-sm uppercase tracking-wider text-frost/50">Certificate</h2>
    <div className="mt-2 flex items-center justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-3 text-sm">
      <span className="text-frost">Certificate of Incorporation — {a.companyRegNo}</span>
      <a href={`/api/applications/${id}/certificate.pdf`} target="_blank" rel="noreferrer" className="text-teal-electric">Download / Print</a>
    </div>
  </>
)}
```

- [ ] **Step 2: `DashboardPage.tsx`** (optional, minimal) — in each order card sub-line, if `a.companyRegNo`, append ` · ${a.companyRegNo}`. Skip if it complicates; not required.

- [ ] **Step 3: Full green**

Run:
```bash
cd backend && npm test && npm run typecheck
cd frontend && npm test && npm run build && npm run lint
```
Expected: all pass, typecheck clean, build clean, 0 lint warnings. Fix breakage minimally.

- [ ] **Step 4: Commit**
```bash
git add frontend/src
git commit -m "feat(web): customer certificate download/print section; phase 4 green"
```

---

## Self-Review Notes (coverage vs design §2–§6)

- Certificate PDF generation (pdfkit) → Task 1. ✅
- companyRegNo + registeredAt → Task 1. ✅
- issue-certificate (staff) + regNo assignment + certificate Document → Task 2. ✅
- certificate.pdf download (owner-or-staff, 404 before issue) → Task 2. ✅
- Staff Issue-certificate action → Task 3. ✅
- Customer Certificates section (download/print) → Task 4. ✅
- Per-application file folder (uploads/<appId>/) → Task 2. ✅
- S3 / multi-cert generation deferred (noted). ✅
