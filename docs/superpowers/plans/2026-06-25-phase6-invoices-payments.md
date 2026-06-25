# Phase 6 — Invoices & Payment Methods Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Per-order invoices (records + PDF), a Payments/Invoices history with download, and a Bank Transfer method (staff-confirmed) alongside Stripe.

**Architecture:** An `Invoice` collection upserted at checkout; `invoice.ts` lib generates the PDF and handles upsert/mark-paid (mirrors `certificate.ts`). Checkout takes a `method`; bank transfer skips Stripe and is confirmed by staff. Stripe webhook also marks the invoice paid. Frontend adds a method selector and an Invoices page.

**Tech Stack:** Express + TS + MongoDB (`backend/`), pdfkit, Vite/React + TS (`frontend/`), Vitest.

## Global Constraints

- Backend under `backend/`, frontend under `frontend/`. TS ESM / TSX.
- Invoice number format: `INV/<year>/<seq4>`. Payment methods: `stripe | bank_transfer`. Invoice status: `unpaid | paid`.
- One Invoice per application (unique `applicationId`); checkout upserts (invoiceNo assigned once).
- Stripe flow + all existing routes unchanged except the additive checkout `method` + invoice marking. Each task ends green and is committed.

---

### Task 1: Invoice model + invoice lib + routes (backend)

**Files:**
- Create: `backend/src/models/Invoice.ts`
- Create: `backend/src/lib/invoice.ts`
- Create: `backend/src/routes/invoices.ts`
- Modify: `backend/src/models/Application.ts` (`paymentMethod`)
- Modify: `backend/src/app.ts` (mount `/api/invoices`)
- Test: `backend/src/__tests__/invoice.test.ts`

**Interfaces:**
- `Invoice` model: `invoiceNo`, `applicationId` (unique), `userId`, `serviceName`, `amountCents`, `currency` (default 'USD'), `method` (`stripe|bank_transfer`), `status` (`unpaid|paid`, default unpaid), `issuedAt`, `paidAt`.
- `Application` adds `paymentMethod: { type: String, enum: ['stripe','bank_transfer'], default: null }`.
- `invoice.ts`:
  - `upsertInvoice(app, method): Promise<IInvoice doc>` — find by applicationId; create with a new invoiceNo if absent (seq = invoice count + 1), else update `method`. Returns the doc.
  - `markInvoicePaid(applicationId): Promise<void>` — set `status='paid', paidAt=now`.
  - `generateInvoicePdf(invoice, app, applicantName): Promise<Buffer>` (pdfkit).
- Routes (requireAuth): `GET /api/invoices` (mine, newest first); `GET /api/invoices/:id/pdf` (owner-or-staff) → stream PDF.

- [ ] **Step 1: Create `backend/src/models/Invoice.ts`**
```ts
import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const invoiceSchema = new Schema({
  invoiceNo: { type: String, required: true },
  applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  serviceName: { type: String, default: '' },
  amountCents: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  method: { type: String, enum: ['stripe', 'bank_transfer'], default: 'stripe' },
  status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  issuedAt: { type: Date, default: () => new Date() },
  paidAt: { type: Date, default: null },
})

export type IInvoice = InferSchemaType<typeof invoiceSchema>
export const Invoice = mongoose.model('Invoice', invoiceSchema)
```

- [ ] **Step 2: `Application.ts`** — add after `stripeSessionId`:
```ts
  paymentMethod: { type: String, enum: ['stripe', 'bank_transfer'], default: null },
```

- [ ] **Step 3: Create `backend/src/lib/invoice.ts`**
```ts
import PDFDocument from 'pdfkit'
import { Invoice, type IInvoice } from '../models/Invoice.js'
import type { IApplication } from '../models/Application.js'

export async function upsertInvoice(app: IApplication & { _id: unknown }, method: 'stripe' | 'bank_transfer') {
  const existing = await Invoice.findOne({ applicationId: app._id })
  if (existing) {
    existing.method = method
    await existing.save()
    return existing
  }
  const seq = (await Invoice.countDocuments({})) + 1
  return Invoice.create({
    invoiceNo: `INV/${new Date().getFullYear()}/${String(seq).padStart(4, '0')}`,
    applicationId: app._id,
    userId: app.userId,
    serviceName: app.serviceName,
    amountCents: app.priceCents,
    currency: 'USD',
    method,
    status: 'unpaid',
  })
}

export async function markInvoicePaid(applicationId: unknown): Promise<void> {
  await Invoice.findOneAndUpdate({ applicationId }, { status: 'paid', paidAt: new Date() })
}

export function generateInvoicePdf(invoice: IInvoice, app: IApplication, applicantName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const amount = `$${(invoice.amountCents / 100).toFixed(2)}`
    doc.fontSize(20).fillColor('#0B1220').text('INVOICE', { align: 'left' })
    doc.fontSize(10).fillColor('#888').text('Chad Business Assist', { align: 'left' })
    doc.moveDown(1)
    doc.fontSize(11).fillColor('#0B1220')
    doc.text(`Invoice no: ${invoice.invoiceNo}`)
    doc.text(`Date: ${new Date(invoice.issuedAt).toISOString().slice(0, 10)}`)
    doc.text(`Bill to: ${applicantName}`)
    doc.text(`Status: ${invoice.status.toUpperCase()} (${invoice.method})`)
    doc.moveDown(1)
    doc.fontSize(12).fillColor('#0B1220').text('Description', 56, doc.y, { continued: true }).text(amount, { align: 'right' })
    doc.moveDown(0.3).fontSize(11).fillColor('#444')
    doc.text(`${invoice.serviceName}${app.entityType ? ' — ' + app.entityType : ''} (${app.companyDetails?.proposedName ?? ''})`, { width: 360 })
    doc.moveDown(1)
    doc.fontSize(13).fillColor('#0B1220').text(`Total: ${amount} ${invoice.currency}`, { align: 'right' })
    doc.moveDown(2)
    doc.fontSize(9).fillColor('#888').text('Thank you for your business. This invoice is computer-generated.', { align: 'center' })
    doc.end()
  })
}
```

- [ ] **Step 4: Create `backend/src/routes/invoices.ts`**
```ts
import { Router } from 'express'
import { Invoice } from '../models/Invoice.js'
import { Application } from '../models/Application.js'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { generateInvoicePdf } from '../lib/invoice.js'

export const invoicesRouter = Router()
invoicesRouter.use(requireAuth)

invoicesRouter.get('/', async (req, res) => {
  const list = await Invoice.find({ userId: req.userId }).sort({ issuedAt: -1 })
  res.json(list)
})

invoicesRouter.get('/:id/pdf', async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
  if (!invoice) return res.status(404).json({ error: 'Not found' })
  const isOwner = String(invoice.userId) === req.userId
  const isStaff = req.userRole && !['customer', 'user'].includes(req.userRole)
  if (!isOwner && !isStaff) return res.status(404).json({ error: 'Not found' })
  const app = await Application.findById(invoice.applicationId)
  if (!app) return res.status(404).json({ error: 'Application missing' })
  const user = await User.findById(invoice.userId).select('fullName')
  const pdf = await generateInvoicePdf(invoice, app, user?.fullName ?? 'Customer')
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNo.replace(/\//g, '-')}.pdf"`)
  res.send(pdf)
})
```

- [ ] **Step 5: Mount in `backend/src/app.ts`**
```ts
import { invoicesRouter } from './routes/invoices.js'
// ...
app.use('/api/invoices', invoicesRouter)
```

- [ ] **Step 6: Write the failing test `backend/src/__tests__/invoice.test.ts`**
```ts
import { describe, it, expect } from 'vitest'
import mongoose from 'mongoose'
import { Application } from '../models/Application.js'
import { upsertInvoice, markInvoicePaid, generateInvoicePdf } from '../lib/invoice.js'
import { Invoice } from '../models/Invoice.js'

async function makeApp() {
  return Application.create({ userId: new mongoose.Types.ObjectId(), serviceKey: 'company-formation', serviceName: 'Company Formation', entityType: 'SARL', companyDetails: { proposedName: 'Acme' }, priceCents: 49900 })
}

describe('invoice lib', () => {
  it('upserts one invoice per application (idempotent invoiceNo) and marks paid', async () => {
    const app = await makeApp()
    const inv1 = await upsertInvoice(app as never, 'stripe')
    const inv2 = await upsertInvoice(app as never, 'bank_transfer')
    expect(inv1.invoiceNo).toBe(inv2.invoiceNo) // same invoice
    expect(await Invoice.countDocuments({ applicationId: app._id })).toBe(1)
    expect(inv2.method).toBe('bank_transfer')
    await markInvoicePaid(app._id)
    const fresh = await Invoice.findOne({ applicationId: app._id })
    expect(fresh!.status).toBe('paid')
  })

  it('generates a PDF buffer', async () => {
    const app = await makeApp()
    const inv = await upsertInvoice(app as never, 'stripe')
    const buf = await generateInvoicePdf(inv, app as never, 'Jo')
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
  })
})
```

- [ ] **Step 7: Run it — expect PASS**

Run: `cd backend && npm test src/__tests__/invoice.test.ts` then `cd backend && npm test && npm run typecheck`

- [ ] **Step 8: Commit**
```bash
git add backend/src/models/Invoice.ts backend/src/lib/invoice.ts backend/src/routes/invoices.ts backend/src/models/Application.ts backend/src/app.ts backend/src/__tests__/invoice.test.ts
git commit -m "feat(backend): invoice model + PDF + routes; application paymentMethod"
```

---

### Task 2: Checkout method + bank transfer + invoice marking + seed (backend)

**Files:**
- Modify: `backend/src/routes/payments.ts` (method param, upsert invoice, bank path, webhook marks invoice)
- Modify: `backend/src/routes/staff.ts` (confirm-payment)
- Modify: `backend/src/seed.ts` (seed invoices)
- Test: `backend/src/__tests__/checkout.invoice.test.ts`

**Interfaces:**
- `POST /api/applications/:id/checkout { method }` (default `'stripe'`): upsert the invoice with the method, set `app.paymentMethod`. For `stripe` → as today, return `{ method:'stripe', url }`. For `bank_transfer` → set `payment_pending`, save, return `{ method:'bank_transfer', invoiceNo, bankDetails }` (static demo bank details), no Stripe session.
- Stripe webhook `paid` → also `markInvoicePaid(app._id)`.
- `POST /api/staff/applications/:id/confirm-payment` (`requireStaff`) → `paymentStatus='paid'`, `pushStatus('paid')`, `markInvoicePaid`, `notifyUser` payment.

- [ ] **Step 1: Update `backend/src/routes/payments.ts` checkout**

Replace the checkout handler body:
```ts
import { upsertInvoice, markInvoicePaid } from '../lib/invoice.js'

const BANK_DETAILS = { bankName: 'Commercial Bank of Chad', accountName: 'Chad Business Assist Ltd', accountNumber: 'CBT-000-123456', swift: 'CBTDTDND', reference: 'Use your invoice number as reference' }

checkoutRouter.post('/', async (req, res) => {
  const id = (req.params as { id: string }).id
  const method = req.body?.method === 'bank_transfer' ? 'bank_transfer' : 'stripe'
  const app = await Application.findOne({ _id: id, userId: req.userId })
  if (!app) return res.status(404).json({ error: 'Not found' })

  const invoice = await upsertInvoice(app as never, method)
  app.paymentMethod = method

  if (method === 'bank_transfer') {
    pushStatus(app, 'payment_pending')
    await app.save()
    return res.json({ method: 'bank_transfer', invoiceNo: invoice.invoiceNo, bankDetails: BANK_DETAILS })
  }

  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price_data: { currency: 'usd', product_data: { name: `${app.serviceName} — ${app.companyDetails?.proposedName ?? ''}` }, unit_amount: app.priceCents }, quantity: 1 }],
    success_url: `${clientUrl}/dashboard?paid=1`,
    cancel_url: `${clientUrl}/dashboard?canceled=1`,
  })
  if (!session.url) return res.status(502).json({ error: 'No checkout URL returned by Stripe' })
  app.stripeSessionId = session.id
  pushStatus(app, 'payment_pending')
  await app.save()
  res.json({ method: 'stripe', url: session.url })
})
```
In the webhook handler, after `await app.save()` (inside the `if (app)` block), add:
```ts
      await markInvoicePaid(app._id)
```

- [ ] **Step 2: Add `confirm-payment` to `backend/src/routes/staff.ts`**

Add import: `import { markInvoicePaid } from '../lib/invoice.js'`. Add route:
```ts
staffRouter.post('/applications/:id/confirm-payment', async (req, res) => {
  const app = await Application.findById(req.params.id)
  if (!app) return res.status(404).json({ error: 'Not found' })
  app.paymentStatus = 'paid'
  pushStatus(app, 'paid', 'Bank transfer confirmed')
  await app.save()
  await markInvoicePaid(app._id)
  await notifyUser(app.userId, { type: 'payment', title: 'Payment received', body: `Your bank transfer for ${app.serviceName} was confirmed.`, link: `/applications/${app._id}` })
  res.json(app)
})
```

- [ ] **Step 3: Seed invoices** in `backend/src/seed.ts` — import `Invoice` and `upsertInvoice`; after the apps + notifications, add:
```ts
import { Invoice } from './models/Invoice.js'
import { upsertInvoice, markInvoicePaid } from './lib/invoice.js'
// ...
await Invoice.deleteMany({})
const reg = created.find((a) => a.status === 'registered')
const rev = created.find((a) => a.status === 'in_review')
if (reg) { await upsertInvoice(reg as never, 'stripe'); await markInvoicePaid(reg._id) }
if (rev) { await upsertInvoice(rev as never, 'bank_transfer') }
```

- [ ] **Step 4: Write the failing test `backend/src/__tests__/checkout.invoice.test.ts`**
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { Application } from '../models/Application.js'
import { Invoice } from '../models/Invoice.js'
import { hashPassword } from '../lib/auth.js'
import { __setStripe } from '../lib/stripe.js'
import { __setTransport } from '../lib/email.js'

const app = createApp()
beforeEach(() => {
  __setTransport({ sendMail: vi.fn(async () => ({})) })
  __setStripe({ checkout: { sessions: { create: vi.fn(async () => ({ id: 'cs_1', url: 'https://stripe.test/pay' })) } }, webhooks: { constructEvent: () => ({ type: 'x', data: { object: {} } }) as never } })
})
async function login(role: string, email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('checkout invoices + bank transfer', () => {
  it('bank transfer returns bank details + creates an unpaid invoice', async () => {
    const customer = await login('customer', 'c@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const res = await customer.post(`/api/applications/${created.body._id}/checkout`).send({ method: 'bank_transfer' })
    expect(res.status).toBe(200)
    expect(res.body.method).toBe('bank_transfer')
    expect(res.body.bankDetails.accountNumber).toBeTruthy()
    const inv = await Invoice.findOne({ applicationId: created.body._id })
    expect(inv!.status).toBe('unpaid')
    expect(inv!.method).toBe('bank_transfer')
  })

  it('staff confirm-payment marks the app + invoice paid', async () => {
    const customer = await login('customer', 'c2@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    await customer.post(`/api/applications/${created.body._id}/checkout`).send({ method: 'bank_transfer' })
    const legal = await login('legal', 'l@x.com')
    const res = await legal.post(`/api/staff/applications/${created.body._id}/confirm-payment`)
    expect(res.status).toBe(200)
    const app2 = await Application.findById(created.body._id)
    expect(app2!.paymentStatus).toBe('paid')
    const inv = await Invoice.findOne({ applicationId: created.body._id })
    expect(inv!.status).toBe('paid')
  })

  it('lists my invoices', async () => {
    const customer = await login('customer', 'c3@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    await customer.post(`/api/applications/${created.body._id}/checkout`).send({ method: 'bank_transfer' })
    const list = await customer.get('/api/invoices')
    expect(list.body.length).toBe(1)
  })
})
```

- [ ] **Step 5: Run it + full suite — expect PASS**

Run: `cd backend && npm test src/__tests__/checkout.invoice.test.ts` then `cd backend && npm test && npm run typecheck`

- [ ] **Step 6: Commit**
```bash
git add backend/src/routes/payments.ts backend/src/routes/staff.ts backend/src/seed.ts backend/src/__tests__/checkout.invoice.test.ts
git commit -m "feat(backend): checkout method + bank transfer + invoice marking + confirm-payment"
```

---

### Task 3: Checkout method selector + staff confirm + types (frontend)

**Files:**
- Modify: `frontend/src/types/app.ts` (`Invoice` type; `Application.paymentMethod?`)
- Modify: `frontend/src/pages/ApplicationWizardPage.tsx` (method selector + bank result)
- Modify: `frontend/src/pages/GenericServiceWizardPage.tsx` (method selector + bank result)
- Modify: `frontend/src/components/staff/LegalPanel.tsx` (Confirm bank payment)
- Modify: `frontend/src/components/staff/AgentPanel.tsx` (Confirm bank payment)
- Test: keep wizard tests green (the create→step-2 happy path is unaffected).

**Interfaces:**
- `Invoice` type: `{ _id, invoiceNo, serviceName, amountCents, currency, method, status, issuedAt }`.
- Both wizards' final review step: a payment-method radio (`Card (Stripe)` / `Bank transfer`; a disabled `Flutterwave — coming soon`). On Pay:
  - Card → `apiPost(checkout,{method:'stripe'})` → if `url`, redirect.
  - Bank transfer → `apiPost(checkout,{method:'bank_transfer'})` → set a local `bankInfo` state from the response and render the bank details + invoice number + a "Go to dashboard" button.
- Staff panels: when `sel.paymentStatus !== 'paid'`, show a **"Confirm bank payment"** button → `apiPost('/api/staff/applications/:id/confirm-payment')` then refetch.

- [ ] **Step 1: `types/app.ts`** — add:
```ts
export interface Invoice { _id: string; invoiceNo: string; serviceName: string; amountCents: number; currency: string; method: string; status: string; issuedAt: string }
```
and in `Application` add `paymentMethod?: 'stripe' | 'bank_transfer' | null`.

- [ ] **Step 2: `ApplicationWizardPage.tsx`** — in the step-6 review, add method state + selector, and update `payAndSubmit`:
```tsx
const [method, setMethod] = useState<'stripe' | 'bank_transfer'>('stripe')
const [bankInfo, setBankInfo] = useState<{ invoiceNo: string; bankDetails: Record<string, string> } | null>(null)
// payAndSubmit:
async function payAndSubmit() {
  if (!app) return
  setBusy(true); setError('')
  try {
    const r = await apiPost<{ method: string; url?: string; invoiceNo?: string; bankDetails?: Record<string, string> }>(`/api/applications/${app._id}/checkout`, { method })
    if (r.method === 'stripe' && r.url) { window.location.href = r.url; return }
    if (r.method === 'bank_transfer') { setBankInfo({ invoiceNo: r.invoiceNo!, bankDetails: r.bankDetails! }); setBusy(false); return }
    setError('Checkout unavailable'); setBusy(false)
  } catch (err) { setError(err instanceof ApiError ? err.message : 'Checkout failed'); setBusy(false) }
}
```
In the step-6 JSX, before the Pay button, render the selector; and if `bankInfo` is set, render the bank instructions instead of the pay button:
```tsx
{bankInfo ? (
  <div className="rounded-xl border border-frost/10 bg-steel/20 p-5 text-sm text-frost">
    <p className="font-medium">Bank transfer instructions — Invoice {bankInfo.invoiceNo}</p>
    {Object.entries(bankInfo.bankDetails).map(([k, v]) => <p key={k} className="text-frost/70">{k}: {v}</p>)}
    <Button className="mt-3" onClick={() => navigate('/dashboard')}>Go to dashboard</Button>
  </div>
) : (
  <>
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm text-frost"><input type="radio" name="pm" checked={method === 'stripe'} onChange={() => setMethod('stripe')} /> Card (Stripe)</label>
      <label className="flex items-center gap-2 text-sm text-frost"><input type="radio" name="pm" checked={method === 'bank_transfer'} onChange={() => setMethod('bank_transfer')} /> Bank transfer</label>
      <label className="flex items-center gap-2 text-sm text-frost/40"><input type="radio" disabled /> Flutterwave — coming soon</label>
    </div>
    <Button disabled={busy} onClick={payAndSubmit}>{busy ? 'Processing…' : 'Pay & submit'}</Button>
  </>
)}
```
(Replace the existing single Pay button in step 6 with this block; keep "Save & finish later".)

- [ ] **Step 3: `GenericServiceWizardPage.tsx`** — apply the same `method`/`bankInfo` state and the same selector + bank-result block in its step-3 review, replacing its `pay()` with the method-aware version (same shape as above, posting to `/api/applications/:id/checkout`).

- [ ] **Step 4: Staff panels confirm-payment** — in `LegalPanel.tsx` and `AgentPanel.tsx`, add:
```tsx
async function confirmPayment() { if (!sel) return; await apiPost(`/api/staff/applications/${sel._id}/confirm-payment`); await open(sel._id); await load() }
```
and in the open-application pane, near the certificate/status block:
```tsx
{sel.paymentStatus !== 'paid' && <Button size="sm" variant="outline" className="mt-2" onClick={confirmPayment}>Confirm bank payment</Button>}
```
(Ensure `apiPost` is imported.)

- [ ] **Step 5: Run the affected tests — expect PASS**

Run: `cd frontend && npm test src/pages/__tests__/application-wizard.test.tsx src/pages/__tests__/generic-service-wizard.test.tsx src/components/staff/__tests__/legal-panel.test.tsx`

- [ ] **Step 6: Commit**
```bash
git add frontend/src/types/app.ts frontend/src/pages/ApplicationWizardPage.tsx frontend/src/pages/GenericServiceWizardPage.tsx frontend/src/components/staff/LegalPanel.tsx frontend/src/components/staff/AgentPanel.tsx
git commit -m "feat(web): checkout method selector + bank transfer + staff confirm payment"
```

---

### Task 4: Invoices page + nav + full green (frontend)

**Files:**
- Create: `frontend/src/pages/InvoicesPage.tsx`
- Modify: `frontend/src/routes/AppRoutes.tsx` (`/invoices` under ProtectedRoute)
- Modify: `frontend/src/pages/DashboardPage.tsx` (link to Invoices) and/or `Navbar.tsx`
- Test: `frontend/src/pages/__tests__/invoices.test.tsx`; then full suites + build.

**Interfaces:**
- `InvoicesPage`: fetches `GET /api/invoices`, lists invoiceNo, serviceName, amount, status badge, method, with a **Download** link to `/api/invoices/:id/pdf`. Empty state when none.

- [ ] **Step 1: Create `frontend/src/pages/InvoicesPage.tsx`**
```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/content/formations'
import { apiGet } from '@/lib/api'
import type { Invoice } from '@/types/app'

export default function InvoicesPage() {
  const [items, setItems] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { apiGet<Invoice[]>('/api/invoices').then(setItems).catch(() => setItems([])).finally(() => setLoading(false)) }, [])

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <div className="flex items-center justify-between border-b border-frost/10 pb-6">
          <h1 className="text-2xl font-semibold text-frost">Invoices & payments</h1>
          <Link to="/dashboard"><Button variant="ghost">Dashboard</Button></Link>
        </div>
        {loading ? <p className="mt-8 text-frost/55">Loading…</p>
          : items.length === 0 ? <p className="mt-8 text-frost/55">No invoices yet.</p>
          : (
            <div className="mt-6 grid gap-2">
              {items.map((inv) => (
                <div key={inv._id} className="flex items-center justify-between rounded-xl border border-frost/10 bg-steel/20 px-5 py-4 text-sm">
                  <div>
                    <p className="font-medium text-frost">{inv.invoiceNo} · {inv.serviceName}</p>
                    <p className="text-frost/55">{formatPrice(inv.amountCents)} · {inv.method} · <span className={inv.status === 'paid' ? 'text-teal-electric' : 'text-indigo-pulse'}>{inv.status}</span></p>
                  </div>
                  <a href={`/api/invoices/${inv._id}/pdf`} target="_blank" rel="noreferrer" className="text-teal-electric">Download</a>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Route + nav**

In `AppRoutes.tsx` ProtectedRoute group:
```tsx
import InvoicesPage from '@/pages/InvoicesPage'
<Route path="/invoices" element={<InvoicesPage />} />
```
In `DashboardPage.tsx` header actions, add a link near "Start application":
```tsx
<Link to="/invoices"><Button variant="ghost">Invoices</Button></Link>
```

- [ ] **Step 3: Write the failing test `frontend/src/pages/__tests__/invoices.test.tsx`**
```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InvoicesPage from '../InvoicesPage'

afterEach(() => vi.restoreAllMocks())

describe('InvoicesPage', () => {
  it('lists invoices with a download link', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([
      { _id: 'i1', invoiceNo: 'INV/2026/0001', serviceName: 'Company Formation', amountCents: 49900, currency: 'USD', method: 'stripe', status: 'paid', issuedAt: '' },
    ]), { status: 200 })))
    render(<MemoryRouter><InvoicesPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText(/INV\/2026\/0001/)).toBeInTheDocument())
    expect(screen.getByText('Download').closest('a')!.getAttribute('href')).toContain('/api/invoices/i1/pdf')
  })
})
```

- [ ] **Step 4: Run it + full green**

Run:
```bash
cd frontend && npm test src/pages/__tests__/invoices.test.tsx
cd backend && npm test && npm run typecheck
cd frontend && npm test && npm run build && npm run lint
```
Expected: all pass, typecheck clean, build clean, 0 lint warnings. Fix breakage minimally.

- [ ] **Step 5: Commit**
```bash
git add frontend/src
git commit -m "feat(web): invoices/payments page; phase 6 green"
```

---

## Self-Review Notes (coverage vs design §2–§7)

- Invoice model + PDF + routes → Task 1. ✅
- paymentMethod on Application → Task 1. ✅
- Checkout method + bank transfer + invoice upsert/mark → Task 2. ✅
- Staff confirm-payment → Task 2. ✅
- Webhook marks invoice paid → Task 2. ✅
- Seed invoices → Task 2. ✅
- Checkout selector + bank result → Task 3. ✅
- Invoices page + nav → Task 4. ✅
- Flutterwave shown disabled (deferred) → Task 3. ✅
