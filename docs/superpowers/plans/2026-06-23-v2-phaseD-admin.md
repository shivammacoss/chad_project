# V2 Phase D — Admin Area Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A self-contained admin area — a separate `/admin/login`, an `AdminRoute` that keeps non-admins out of `/admin/*` (redirecting to `/admin/login`), and a rich review screen where an admin opens an application and sees company details, every owner (role + shareholding), virtual office, per-owner documents (view + approve/reject), and advances status.

**Architecture:** Runs after Phase C. Mostly frontend. One small backend addition: admin-scoped endpoints to fetch a single application and its documents (the existing document-list route is user-scoped). The document file route already allows admins.

**Tech Stack:** Express/Mongoose backend (`backend/`), React/TS frontend (`frontend/`), Vitest.

## Global Constraints

- Backend under `backend/`, frontend under `frontend/`. TS ESM / TSX.
- Admin endpoints require `requireAuth + requireAdmin`. Admin statuses: `in_review|filing_submitted|registered|needs_more_docs|rejected`. Document review: `approved|rejected`.
- `/admin/login` is a distinct page; `AdminRoute` redirects non-admins to `/admin/login` (NOT `/dashboard`).
- Document file URL: `GET /api/applications/:id/documents/:docId/file` (already admin-allowed).
- Each task ends green and is committed.

---

### Task 1: Admin-scoped application + documents fetch (backend)

**Files:**
- Modify: `backend/src/routes/admin.ts`
- Test: `backend/src/__tests__/admin.routes.test.ts` (extend)

**Interfaces:**
- Adds `GET /api/admin/applications/:id` → one application, populated `userId` (email+fullName); 404 if missing.
- Adds `GET /api/admin/applications/:id/documents` → all documents for that application (admin-scoped, not owner-scoped).

- [ ] **Step 1: Add the two routes in `backend/src/routes/admin.ts`** (after the existing `GET /applications`)

```ts
adminRouter.get('/applications/:id', async (req, res) => {
  const app = await Application.findById(req.params.id).populate('userId', 'email fullName')
  if (!app) return res.status(404).json({ error: 'Not found' })
  res.json(app)
})

adminRouter.get('/applications/:id/documents', async (req, res) => {
  const docs = await DocumentModel.find({ applicationId: req.params.id }).sort({ uploadedAt: 1 })
  res.json(docs)
})
```

- [ ] **Step 2: Extend `backend/src/__tests__/admin.routes.test.ts`** — add a test after the existing ones:

```ts
  it('fetches one application and its documents as admin', async () => {
    const user = await makeUser('user', 'u2@x.com')
    const created = await user.post('/api/applications').send({ entityType: 'SARL', packageTier: 'standard' })
    await user
      .post(`/api/applications/${created.body._id}/documents`)
      .field('type', 'passport').field('ownerName', 'Alice')
      .attach('file', Buffer.from('x'), { filename: 'p.pdf', contentType: 'application/pdf' })
    const admin = await makeUser('admin', 'admin2@x.com')
    const one = await admin.get(`/api/admin/applications/${created.body._id}`)
    expect(one.status).toBe(200)
    expect(one.body.entityType).toBe('SARL')
    const docs = await admin.get(`/api/admin/applications/${created.body._id}/documents`)
    expect(docs.status).toBe(200)
    expect(docs.body).toHaveLength(1)
    expect(docs.body[0].ownerName).toBe('Alice')
  })
```

- [ ] **Step 3: Run the admin test — expect PASS**

Run: `cd backend && npm test src/__tests__/admin.routes.test.ts`

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/admin.ts backend/src/__tests__/admin.routes.test.ts
git commit -m "feat(backend): admin fetch single application + its documents"
```

---

### Task 2: Admin login page + self-contained AdminRoute

**Files:**
- Create: `frontend/src/pages/AdminLoginPage.tsx`
- Modify: `frontend/src/components/auth/AdminRoute.tsx`
- Modify: `frontend/src/routes/AppRoutes.tsx` (add `/admin/login`)
- Test: `frontend/src/pages/__tests__/admin-login.test.tsx`

**Interfaces:**
- `AdminLoginPage`: email+password form → `useAuth().login`; on success, if `role === 'admin'` navigate `/admin`, else show "This account is not an admin" and do not proceed.
- `AdminRoute`: non-admins (or logged-out) redirect to `/admin/login`.

- [ ] **Step 1: Create `frontend/src/pages/AdminLoginPage.tsx`**

```tsx
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import AuthShell from '@/components/auth/AuthShell'
import { useAuth } from '@/store/AuthContext'
import { ApiError } from '@/lib/api'

const inputCls = 'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function AdminLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setError(''); setBusy(true)
    try {
      const u = await login(email, password)
      if (u.role === 'admin') navigate('/admin')
      else setError('This account is not an admin.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally { setBusy(false) }
  }

  return (
    <AuthShell title="Admin sign in" subtitle="Staff access only">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={inputCls} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-indigo-pulse">{error}</p>}
        <Button type="submit" fullWidth disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
      </form>
    </AuthShell>
  )
}
```

- [ ] **Step 2: Update `frontend/src/components/auth/AdminRoute.tsx`** — redirect target → `/admin/login`:

```tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'

export default function AdminRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">Loading…</div>
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/admin/login" replace />
}
```

- [ ] **Step 3: Add `/admin/login` route in `frontend/src/routes/AppRoutes.tsx`** (inside MainLayout block, NOT inside AdminRoute):

```tsx
import AdminLoginPage from '@/pages/AdminLoginPage'
<Route path="/admin/login" element={<AdminLoginPage />} />
```

- [ ] **Step 4: Write the failing test `frontend/src/pages/__tests__/admin-login.test.tsx`**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminLoginPage from '../AdminLoginPage'
import { AuthProvider } from '@/store/AuthContext'

afterEach(() => vi.restoreAllMocks())

describe('AdminLoginPage', () => {
  it('rejects a non-admin account', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string, opts?: RequestInit) => {
      if (url.includes('/login') && opts?.method === 'POST')
        return new Response(JSON.stringify({ id: '1', email: 'u@x.com', fullName: 'U', role: 'user' }), { status: 200 })
      return new Response('{}', { status: 401 })
    }))
    render(<MemoryRouter><AuthProvider><AdminLoginPage /></AuthProvider></MemoryRouter>)
    await userEvent.type(screen.getByPlaceholderText('Email'), 'u@x.com')
    await userEvent.type(screen.getByPlaceholderText('Password'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText(/not an admin/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run it — expect PASS**

Run: `cd frontend && npm test src/pages/__tests__/admin-login.test.tsx`

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/AdminLoginPage.tsx frontend/src/components/auth/AdminRoute.tsx frontend/src/routes/AppRoutes.tsx frontend/src/pages/__tests__/admin-login.test.tsx
git commit -m "feat(web): separate admin login + self-contained admin route"
```

---

### Task 3: Rich admin review screen

**Files:**
- Rewrite: `frontend/src/pages/AdminPage.tsx`
- Test: `frontend/src/pages/__tests__/admin.test.tsx` (update)

**Interfaces:**
- Consumes `apiGet<Application[]>('/api/admin/applications')`, `apiGet<Application>('/api/admin/applications/:id')`, `apiGet<DocItem[]>('/api/admin/applications/:id/documents')`, `apiPatch('/api/admin/applications/:id/status', {status})`, `apiPatch('/api/admin/documents/:docId', {status})`.
- A two-pane screen: left = list of applications (company, client email, status badge); selecting one loads the right pane = full review (company details, owners with role + %, virtual office, documents with a "View" link to the file route + Approve/Reject buttons, and status-advance buttons). After any PATCH, refetch the open application + its documents (and the list).

- [ ] **Step 1: Rewrite `frontend/src/pages/AdminPage.tsx`**

```tsx
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { ENTITY_TYPES, formatPrice } from '@/content/formations'
import { apiGet, apiPatch } from '@/lib/api'
import type { Application, DocItem } from '@/types/app'

const ADMIN_STATUSES = ['in_review', 'filing_submitted', 'registered', 'needs_more_docs', 'rejected'] as const
const entityLabel = (v: string) => ENTITY_TYPES.find((e) => e.value === v)?.label ?? v
function clientEmail(a: Application): string {
  return typeof a.userId === 'object' && a.userId ? a.userId.email : '—'
}

export default function AdminPage() {
  const [items, setItems] = useState<Application[]>([])
  const [selected, setSelected] = useState<Application | null>(null)
  const [docs, setDocs] = useState<DocItem[]>([])
  const [busy, setBusy] = useState(false)

  const loadList = useCallback(async () => { setItems(await apiGet<Application[]>('/api/admin/applications')) }, [])
  useEffect(() => { loadList() }, [loadList])

  const open = useCallback(async (id: string) => {
    setSelected(await apiGet<Application>(`/api/admin/applications/${id}`))
    setDocs(await apiGet<DocItem[]>(`/api/admin/applications/${id}/documents`))
  }, [])

  async function advance(status: string) {
    if (!selected) return
    setBusy(true)
    try { await apiPatch(`/api/admin/applications/${selected._id}/status`, { status }); await open(selected._id); await loadList() }
    finally { setBusy(false) }
  }
  async function reviewDoc(docId: string, status: 'approved' | 'rejected') {
    if (!selected) return
    await apiPatch(`/api/admin/documents/${docId}`, { status })
    setDocs(await apiGet<DocItem[]>(`/api/admin/applications/${selected._id}/documents`))
  }

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h1 className="text-2xl font-semibold text-frost">Applications</h1>
          <div className="mt-6 grid gap-2">
            {items.map((a) => (
              <button key={a._id} type="button" onClick={() => open(a._id)}
                className={`rounded-xl border px-4 py-3 text-left ${selected?._id === a._id ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-frost">{a.companyDetails?.proposedName || 'Untitled'}</span>
                  <StatusBadge status={a.status} />
                </div>
                <span className="text-sm text-frost/55">{entityLabel(a.entityType)} · {clientEmail(a)}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          {!selected ? <p className="text-frost/55">Select an application to review.</p> : (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-frost">{selected.companyDetails.proposedName}</h2>
                  <p className="text-sm text-frost/55">{entityLabel(selected.entityType)} · {formatPrice(selected.priceCents)} · {clientEmail(selected)}</p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              <div className="rounded-lg border border-frost/10 bg-steel/20 p-4 text-sm text-frost/80">
                <p>Activity: {selected.companyDetails.businessActivity || '—'}</p>
                <p>Capital: {selected.companyDetails.shareCapitalFCFA?.toLocaleString() ?? '—'} FCFA · City: {selected.companyDetails.city}</p>
                <p>Virtual office: {selected.virtualOffice.wanted ? selected.virtualOffice.plan : 'none'}</p>
              </div>

              <div>
                <h3 className="text-sm uppercase tracking-wider text-frost/50">Owners</h3>
                <div className="mt-2 grid gap-2">
                  {selected.owners.map((o, i) => (
                    <div key={i} className="flex justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-2 text-sm">
                      <span className="text-frost">{o.fullName} <span className="text-frost/50">({o.role})</span></span>
                      <span className="text-frost/60">{o.nationality} · {o.ownershipPercent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm uppercase tracking-wider text-frost/50">Documents</h3>
                <div className="mt-2 grid gap-2">
                  {docs.length === 0 && <p className="text-sm text-frost/55">No documents.</p>}
                  {docs.map((d) => (
                    <div key={d._id} className="flex items-center justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-2 text-sm">
                      <span className="text-frost">{d.ownerName ? `${d.ownerName} — ` : ''}{d.type}</span>
                      <span className="flex items-center gap-3">
                        <a href={`/api/applications/${selected._id}/documents/${d._id}/file`} target="_blank" rel="noreferrer" className="text-teal-electric">View</a>
                        <span className="text-frost/50">{d.status}</span>
                        <button type="button" className="text-teal-electric" onClick={() => reviewDoc(d._id, 'approved')}>Approve</button>
                        <button type="button" className="text-indigo-pulse" onClick={() => reviewDoc(d._id, 'rejected')}>Reject</button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm uppercase tracking-wider text-frost/50">Advance status</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ADMIN_STATUSES.map((s) => (
                    <Button key={s} size="sm" variant="outline" disabled={busy} onClick={() => advance(s)}>{s}</Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `frontend/src/pages/__tests__/admin.test.tsx`**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminPage from '../AdminPage'

afterEach(() => vi.restoreAllMocks())

const APP = {
  _id: 'a1', entityType: 'SARL', packageTier: 'standard',
  companyDetails: { proposedName: 'Acme SARL', city: "N'Djamena" },
  owners: [{ fullName: 'Alice', role: 'both', nationality: 'IN', ownershipPercent: 100, isPrimaryContact: true }],
  virtualOffice: { wanted: false }, priceCents: 49900, status: 'in_review', paymentStatus: 'paid',
  statusHistory: [], currentStep: 7, createdAt: '', userId: { _id: 'u1', email: 'c@x.com', fullName: 'C' },
}

describe('AdminPage', () => {
  it('lists, opens an application, and advances status', async () => {
    const patch = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', vi.fn(async (url: string, opts?: RequestInit) => {
      if (opts?.method === 'PATCH') return patch()
      if (url.endsWith('/documents')) return new Response('[]', { status: 200 })
      if (url.includes('/api/admin/applications/a1')) return new Response(JSON.stringify(APP), { status: 200 })
      if (url.includes('/api/admin/applications')) return new Response(JSON.stringify([APP]), { status: 200 })
      return new Response('[]', { status: 200 })
    }))
    render(<MemoryRouter><AdminPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Acme SARL')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Acme SARL'))
    await waitFor(() => expect(screen.getByText('Alice', { exact: false })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'registered' }))
    expect(patch).toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Run it — expect PASS**

Run: `cd frontend && npm test src/pages/__tests__/admin.test.tsx`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/AdminPage.tsx frontend/src/pages/__tests__/admin.test.tsx
git commit -m "feat(web): rich admin review (owners, documents view/approve, status)"
```

---

### Task 4: Full green + manual verification

**Files:**
- Test: full backend + frontend suites + build.

- [ ] **Step 1: Full backend suite + typecheck**

Run: `cd backend && npm test && npm run typecheck`
Expected: all pass, typecheck clean.

- [ ] **Step 2: Full frontend suite + build + lint**

Run: `cd frontend && npm test && npm run build && npm run lint`
Expected: all tests pass, build clean, 0 lint warnings.

- [ ] **Step 3: Commit any final fixes (only if needed)**

```bash
git add -A
git commit -m "chore: phase D green"
```
(If nothing changed, skip.)

---

## Self-Review Notes (coverage vs spec §4 admin, §9)

- Separate `/admin/login` + non-admin rejection → Task 2. ✅
- `AdminRoute` self-contained (→ /admin/login) → Task 2. ✅
- Admin fetch one application + its documents → Task 1. ✅
- Rich review: owners (role + %), virtual office, per-owner documents view + approve/reject, advance status → Task 3. ✅
- Full green → Task 4. ✅
