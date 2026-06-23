# Chad Business-Assist — Frontend Integration Implementation Plan (Phase 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing Vite/React frontend to the Phase 1 backend — signup/login with email verification, a client dashboard, a company-formation wizard (entity → details → KYC upload → Stripe checkout → status tracking), and an admin console.

**Architecture:** The existing SPA gains an `AuthContext`, a typed `api` fetch client (cookie-based auth), and protected routes. The leftover grid-template `DashboardPage` is replaced with a real client dashboard. New pages reuse the existing `Button`, `Badge`, and `cn` design primitives. Dev requests to `/api/*` are proxied to the Express server on port 4000.

**Tech Stack:** React 18, react-router-dom 6, TypeScript, Tailwind (existing theme: `navy`, `steel`, `frost`, `teal-electric`, `indigo-pulse`). Tests: Vitest + @testing-library/react + jsdom (added in Task 1).

## Global Constraints

- **Phase 1 backend must be implemented first** — this plan consumes its endpoints.
- Reuse existing primitives: `Button` (`@/components/ui/Button`), `Badge`, `cn` (`@/lib/utils`). Do not introduce a UI library.
- Match the dark theme (`bg-navy`, `text-frost`, accent `teal-electric`). Use existing Tailwind tokens only.
- All API calls go through `@/lib/api` (never raw `fetch` in components). All requests send cookies (`credentials: 'include'`).
- Entity types (exact): `SARL`, `SARL_U`, `SA`, `BRANCH`, `REP_OFFICE`. Statuses and document types exactly as in the backend spec.
- Each task ends green (tests pass / typecheck clean) and is committed.

---

### Task 1: Frontend test tooling + Vite API proxy

**Files:**
- Modify: root `package.json` (add test deps + `test` script)
- Modify: `vite.config.ts` (add `/api` proxy + vitest config)
- Create: `src/test/setup.ts`
- Test: `src/lib/__tests__/smoke.test.tsx`

**Interfaces:**
- Produces: a working `npm test` (Vitest, jsdom) and a dev proxy so `/api/*` → `http://localhost:4000`.

- [ ] **Step 1: Add dev deps + script to root `package.json`**

Add to `devDependencies`:
```json
"@testing-library/jest-dom": "^6.4.8",
"@testing-library/react": "^16.0.0",
"@testing-library/user-event": "^14.5.2",
"jsdom": "^25.0.0",
"vitest": "^2.1.0"
```
Add to `scripts`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Update `vite.config.ts`**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 3: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Write the smoke test `src/lib/__tests__/smoke.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('test tooling', () => {
  it('renders', () => {
    render(<p>hello chad</p>)
    expect(screen.getByText('hello chad')).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Install + run**

Run: `npm install && npm test`
Expected: smoke test PASSES.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/test src/lib/__tests__
git commit -m "feat(web): add vitest + RTL tooling and /api dev proxy"
```

---

### Task 2: Typed API client

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/types/app.ts`
- Test: `src/lib/__tests__/api.test.ts`

**Interfaces:**
- Produces `src/types/app.ts`:
  ```ts
  export type EntityType = 'SARL' | 'SARL_U' | 'SA' | 'BRANCH' | 'REP_OFFICE'
  export type FormationStatus =
    | 'draft' | 'documents_submitted' | 'payment_pending' | 'paid'
    | 'in_review' | 'filing_submitted' | 'registered' | 'needs_more_docs' | 'rejected'
  export type DocType = 'passport' | 'address_proof' | 'photo' | 'other'
  export interface AuthUser { id: string; email: string; fullName: string; country?: string; role: 'user' | 'admin' }
  export interface Formation {
    _id: string; entityType: EntityType; companyName: string
    packageTier: 'standard' | 'premium'; priceCents: number
    status: FormationStatus; paymentStatus: 'unpaid' | 'paid'
    statusHistory: { status: string; note?: string; at: string }[]; createdAt: string
    userId?: string | { _id: string; email: string; fullName: string }
  }
  export interface DocItem {
    _id: string; type: DocType; fileName: string
    status: 'pending' | 'approved' | 'rejected'; uploadedAt: string
  }
  ```
- Produces `src/lib/api.ts`:
  - `apiGet<T>(path): Promise<T>`
  - `apiPost<T>(path, body?): Promise<T>`
  - `apiPatch<T>(path, body): Promise<T>`
  - `apiUpload<T>(path, form: FormData): Promise<T>`
  - All throw `ApiError { status, message }` on non-2xx. All use `credentials: 'include'`.

- [ ] **Step 1: Create `src/types/app.ts`** (content exactly as the Interfaces block above).

- [ ] **Step 2: Create `src/lib/api.ts`**

```ts
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error ?? res.statusText)
  }
  return data as T
}

export function apiGet<T>(path: string): Promise<T> {
  return fetch(path, { credentials: 'include' }).then(handle<T>)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(handle<T>)
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return fetch(path, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handle<T>)
}

export function apiUpload<T>(path: string, form: FormData): Promise<T> {
  return fetch(path, { method: 'POST', credentials: 'include', body: form }).then(handle<T>)
}
```

- [ ] **Step 3: Write the failing test `src/lib/__tests__/api.test.ts`**

```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { apiGet, apiPost, ApiError } from '../api'

afterEach(() => vi.restoreAllMocks())

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  )
}

describe('api client', () => {
  it('returns parsed json on success', async () => {
    mockFetch(200, { ok: true })
    expect(await apiGet<{ ok: boolean }>('/api/health')).toEqual({ ok: true })
  })

  it('throws ApiError with server message on failure', async () => {
    mockFetch(401, { error: 'Not authenticated' })
    await expect(apiPost('/api/auth/me')).rejects.toMatchObject({
      status: 401,
      message: 'Not authenticated',
    })
    await expect(apiPost('/api/auth/me')).rejects.toBeInstanceOf(ApiError)
  })
})
```

- [ ] **Step 4: Run tests**

Run: `npm test src/lib/__tests__/api.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/api.ts src/types/app.ts src/lib/__tests__/api.test.ts
git commit -m "feat(web): typed api client + shared app types"
```

---

### Task 3: Auth context + route guards

**Files:**
- Create: `src/store/AuthContext.tsx`
- Create: `src/components/auth/ProtectedRoute.tsx`
- Create: `src/components/auth/AdminRoute.tsx`
- Modify: `src/App.tsx` (wrap router with `AuthProvider`)
- Test: `src/store/__tests__/auth-context.test.tsx`

**Interfaces:**
- Produces `AuthProvider` + `useAuth(): { user, loading, login, logout, refresh }`.
  - `login(email, password): Promise<AuthUser>` → POST `/api/auth/login`, sets `user`.
  - `logout(): Promise<void>` → POST `/api/auth/logout`, clears `user`.
  - `refresh()` → GET `/api/auth/me`, sets `user` or `null`. Runs once on mount.
- `ProtectedRoute` renders `<Outlet/>` if `user`, else `<Navigate to="/login"/>`.
- `AdminRoute` renders `<Outlet/>` if `user?.role === 'admin'`, else `<Navigate to="/dashboard"/>`.

- [ ] **Step 1: Create `src/store/AuthContext.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import type { AuthUser } from '@/types/app'

interface AuthValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthCtx = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    try {
      setUser(await apiGet<AuthUser>('/api/auth/me'))
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const u = await apiPost<AuthUser>('/api/auth/login', { email, password })
    setUser(u)
    return u
  }

  async function logout() {
    await apiPost('/api/auth/logout')
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

- [ ] **Step 2: Create `src/components/auth/ProtectedRoute.tsx`**

```tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">Loading…</div>
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
```

- [ ] **Step 3: Create `src/components/auth/AdminRoute.tsx`**

```tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'

export default function AdminRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">Loading…</div>
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />
}
```

- [ ] **Step 4: Wrap router in `src/App.tsx`**

```tsx
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from '@/routes/AppRoutes'
import { AuthProvider } from '@/store/AuthContext'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 5: Write the failing test `src/store/__tests__/auth-context.test.tsx`**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

afterEach(() => vi.restoreAllMocks())

function Probe() {
  const { user, loading } = useAuth()
  return <div>{loading ? 'loading' : (user?.email ?? 'anon')}</div>
}

describe('AuthProvider', () => {
  it('shows anon when /me is unauthorized', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 401 })))
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByText('anon')).toBeInTheDocument())
  })

  it('shows the user when /me succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ id: '1', email: 'a@x.com', fullName: 'A', role: 'user' }), { status: 200 })),
    )
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByText('a@x.com')).toBeInTheDocument())
  })
})
```

- [ ] **Step 6: Run tests**

Run: `npm test src/store/__tests__/auth-context.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/store/AuthContext.tsx src/components/auth src/App.tsx src/store/__tests__
git commit -m "feat(web): auth context + protected/admin route guards"
```

---

### Task 4: Login, Signup, Verify-email pages + routes

**Files:**
- Create: `src/pages/LoginPage.tsx`
- Create: `src/pages/SignupPage.tsx`
- Create: `src/pages/VerifyEmailPage.tsx`
- Create: `src/components/auth/AuthShell.tsx`
- Modify: `src/routes/AppRoutes.tsx` (add `/login`, `/signup`, `/verify-email`)
- Test: `src/pages/__tests__/login.test.tsx`

**Interfaces:**
- Consumes: `useAuth().login`, `apiPost` for signup/resend, `apiGet` for verify.
- `AuthShell` — shared centered card layout (`bg-navy`, bordered `steel` card) wrapping auth forms.
- Routes added **outside** `MainLayout`'s nav chrome is not required; place them inside `MainLayout` for shared navbar/footer (consistent with existing routes).

- [ ] **Step 1: Create `src/components/auth/AuthShell.tsx`**

```tsx
import type { ReactNode } from 'react'

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-5 pt-16">
      <div className="w-full max-w-md rounded-2xl border border-frost/10 bg-steel/30 p-8">
        <h1 className="text-2xl font-semibold text-frost">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-frost/55">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/pages/LoginPage.tsx`**

```tsx
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import AuthShell from '@/components/auth/AuthShell'
import { useAuth } from '@/store/AuthContext'
import { ApiError } from '@/lib/api'

const inputCls =
  'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const u = await login(email, password)
      navigate(u.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage your formations">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={inputCls} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-indigo-pulse">{error}</p>}
        <Button type="submit" fullWidth disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</Button>
        <p className="text-center text-sm text-frost/55">
          No account? <Link to="/signup" className="text-teal-electric">Sign up</Link>
        </p>
      </form>
    </AuthShell>
  )
}
```

- [ ] **Step 3: Create `src/pages/SignupPage.tsx`**

```tsx
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import AuthShell from '@/components/auth/AuthShell'
import { apiPost, ApiError } from '@/lib/api'

const inputCls =
  'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: '', email: '', country: '', password: '' })
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await apiPost('/api/auth/signup', form)
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Signup failed')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <AuthShell title="Check your inbox" subtitle={`We sent a verification link to ${form.email}.`}>
        <p className="text-sm text-frost/70">Click the link to activate your account, then log in.</p>
        <Link to="/login" className="mt-4 inline-block text-teal-electric">Go to login</Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create your account" subtitle="Start a company in Chad from anywhere">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input className={inputCls} placeholder="Full name" value={form.fullName} onChange={set('fullName')} required />
        <input className={inputCls} type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input className={inputCls} placeholder="Country" value={form.country} onChange={set('country')} required />
        <input className={inputCls} type="password" placeholder="Password (min 8 chars)" minLength={8} value={form.password} onChange={set('password')} required />
        {error && <p className="text-sm text-indigo-pulse">{error}</p>}
        <Button type="submit" fullWidth disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</Button>
        <p className="text-center text-sm text-frost/55">
          Have an account? <Link to="/login" className="text-teal-electric">Log in</Link>
        </p>
      </form>
    </AuthShell>
  )
}
```

- [ ] **Step 4: Create `src/pages/VerifyEmailPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthShell from '@/components/auth/AuthShell'
import { apiGet } from '@/lib/api'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const [state, setState] = useState<'pending' | 'ok' | 'fail'>('pending')

  useEffect(() => {
    const token = params.get('token')
    if (!token) return setState('fail')
    apiGet(`/api/auth/verify-email?token=${token}`)
      .then(() => setState('ok'))
      .catch(() => setState('fail'))
  }, [params])

  const copy = {
    pending: { t: 'Verifying…', s: 'One moment.' },
    ok: { t: 'Email verified ✅', s: 'You can now log in.' },
    fail: { t: 'Verification failed', s: 'The link is invalid or expired.' },
  }[state]

  return (
    <AuthShell title={copy.t} subtitle={copy.s}>
      {state !== 'pending' && <Link to="/login" className="text-teal-electric">Go to login</Link>}
    </AuthShell>
  )
}
```

- [ ] **Step 5: Add routes in `src/routes/AppRoutes.tsx`**

Inside the `<Route element={<MainLayout />}>` block, alongside the existing bespoke pages:
```tsx
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import VerifyEmailPage from '@/pages/VerifyEmailPage'
// ...
<Route path="/login" element={<LoginPage />} />
<Route path="/signup" element={<SignupPage />} />
<Route path="/verify-email" element={<VerifyEmailPage />} />
```

- [ ] **Step 6: Write the failing test `src/pages/__tests__/login.test.tsx`**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../LoginPage'
import { AuthProvider } from '@/store/AuthContext'

afterEach(() => vi.restoreAllMocks())

function renderLogin() {
  // /me on mount → 401 (anon); login POST → 200
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, opts?: RequestInit) => {
      if (typeof url === 'string' && url.includes('/login') && opts?.method === 'POST') {
        return new Response(JSON.stringify({ id: '1', email: 'a@x.com', fullName: 'A', role: 'user' }), { status: 200 })
      }
      return new Response('{}', { status: 401 })
    }),
  )
  render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('renders the form', () => {
    renderLogin()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('submits credentials', async () => {
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('Email'), 'a@x.com')
    await userEvent.type(screen.getByPlaceholderText('Password'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
```

- [ ] **Step 7: Run tests**

Run: `npm test src/pages/__tests__/login.test.tsx`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/pages/LoginPage.tsx src/pages/SignupPage.tsx src/pages/VerifyEmailPage.tsx src/components/auth/AuthShell.tsx src/routes/AppRoutes.tsx src/pages/__tests__
git commit -m "feat(web): login, signup, verify-email pages"
```

---

### Task 5: Formation status badge + entity metadata (shared UI)

**Files:**
- Create: `src/content/formations.ts`
- Create: `src/components/formations/StatusBadge.tsx`
- Test: `src/components/formations/__tests__/status-badge.test.tsx`

**Interfaces:**
- Produces `ENTITY_TYPES: { value: EntityType; label: string; blurb: string }[]` and `formatPrice(cents: number): string` and `STATUS_LABEL: Record<FormationStatus, string>` in `src/content/formations.ts`.
- Produces `<StatusBadge status={FormationStatus} />` mapping each status to a `Badge` tone (`registered`→live, `rejected`/`needs_more_docs`→warning, else neutral).

- [ ] **Step 1: Create `src/content/formations.ts`**

```ts
import type { EntityType, FormationStatus } from '@/types/app'

export const ENTITY_TYPES: { value: EntityType; label: string; blurb: string }[] = [
  { value: 'SARL', label: 'SARL', blurb: 'Limited liability company — the standard for foreign investors.' },
  { value: 'SARL_U', label: 'SARL Unipersonnelle', blurb: 'Single-member limited liability company.' },
  { value: 'SA', label: 'SA', blurb: 'Public limited company for larger ventures.' },
  { value: 'BRANCH', label: 'Branch (Succursale)', blurb: 'A branch of an existing foreign company.' },
  { value: 'REP_OFFICE', label: 'Representative Office', blurb: 'Non-trading liaison presence in Chad.' },
]

export const STATUS_LABEL: Record<FormationStatus, string> = {
  draft: 'Draft',
  documents_submitted: 'Documents submitted',
  payment_pending: 'Payment pending',
  paid: 'Paid',
  in_review: 'In review',
  filing_submitted: 'Filing submitted (ANIE)',
  registered: 'Registered',
  needs_more_docs: 'Needs more documents',
  rejected: 'Rejected',
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}
```

- [ ] **Step 2: Create `src/components/formations/StatusBadge.tsx`**

```tsx
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { STATUS_LABEL } from '@/content/formations'
import type { FormationStatus } from '@/types/app'

const TONE: Record<FormationStatus, BadgeTone> = {
  draft: 'neutral',
  documents_submitted: 'neutral',
  payment_pending: 'warning',
  paid: 'neutral',
  in_review: 'neutral',
  filing_submitted: 'neutral',
  registered: 'live',
  needs_more_docs: 'warning',
  rejected: 'warning',
}

export function StatusBadge({ status }: { status: FormationStatus }) {
  return <Badge tone={TONE[status]} withDot={status === 'registered'}>{STATUS_LABEL[status]}</Badge>
}
```

- [ ] **Step 3: Write the failing test `src/components/formations/__tests__/status-badge.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../StatusBadge'
import { formatPrice } from '@/content/formations'

describe('StatusBadge / formatPrice', () => {
  it('renders the human label', () => {
    render(<StatusBadge status="registered" />)
    expect(screen.getByText('Registered')).toBeInTheDocument()
  })
  it('formats price from cents', () => {
    expect(formatPrice(49900)).toBe('$499.00')
  })
})
```

- [ ] **Step 4: Run tests**

Run: `npm test src/components/formations/__tests__/status-badge.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/formations.ts src/components/formations
git commit -m "feat(web): formation entity metadata + status badge"
```

---

### Task 6: Client Dashboard (replace grid mock)

**Files:**
- Rewrite: `src/pages/DashboardPage.tsx` (remove grid-template content entirely)
- Modify: `src/routes/AppRoutes.tsx` (put `/dashboard` behind `ProtectedRoute`)
- Test: `src/pages/__tests__/dashboard.test.tsx`

**Interfaces:**
- Consumes: `apiGet<Formation[]>('/api/formations')`, `useAuth`, `StatusBadge`, `formatPrice`, `ENTITY_TYPES`.
- Renders the user's formations as cards with company name, entity label, status badge, price; a "Start new formation" button → `/formations/new`; empty state when none.

- [ ] **Step 1: Rewrite `src/pages/DashboardPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { ENTITY_TYPES, formatPrice } from '@/content/formations'
import { apiGet } from '@/lib/api'
import { useAuth } from '@/store/AuthContext'
import type { Formation } from '@/types/app'

const entityLabel = (v: string) => ENTITY_TYPES.find((e) => e.value === v)?.label ?? v

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [items, setItems] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet<Formation[]>('/api/formations')
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-4 border-b border-frost/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-frost">Hi {user?.fullName}</h1>
            <p className="mt-1 text-sm text-frost/55">Your company formations in Chad.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/formations/new"><Button>Start new formation</Button></Link>
            <Button variant="ghost" onClick={() => logout()}>Log out</Button>
          </div>
        </div>

        {loading ? (
          <p className="mt-10 text-frost/55">Loading…</p>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-xl border border-frost/10 bg-steel/20 p-10 text-center">
            <p className="text-frost/70">No formations yet.</p>
            <Link to="/formations/new" className="mt-4 inline-block"><Button>Start your first formation</Button></Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {items.map((f) => (
              <Link
                key={f._id}
                to={`/formations/${f._id}`}
                className="flex items-center justify-between rounded-xl border border-frost/10 bg-steel/20 px-6 py-5 transition-colors hover:border-teal-electric/30"
              >
                <div>
                  <p className="font-medium text-frost">{f.companyName}</p>
                  <p className="text-sm text-frost/55">{entityLabel(f.entityType)} · {formatPrice(f.priceCents)}</p>
                </div>
                <StatusBadge status={f.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Guard `/dashboard` in `src/routes/AppRoutes.tsx`**

Replace the plain `/dashboard` route with a guarded group:
```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute'
// ...
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>
```
(Remove the old unguarded `<Route path="/dashboard" .../>`.)

- [ ] **Step 3: Write the failing test `src/pages/__tests__/dashboard.test.tsx`**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from '../DashboardPage'
import { AuthProvider } from '@/store/AuthContext'

afterEach(() => vi.restoreAllMocks())

describe('DashboardPage', () => {
  it('lists the user formations', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/api/auth/me')) {
          return new Response(JSON.stringify({ id: '1', email: 'a@x.com', fullName: 'Jo', role: 'user' }), { status: 200 })
        }
        if (url.includes('/api/formations')) {
          return new Response(
            JSON.stringify([
              { _id: 'f1', entityType: 'SARL', companyName: 'Acme SARL', packageTier: 'standard', priceCents: 49900, status: 'registered', paymentStatus: 'paid', statusHistory: [], createdAt: '' },
            ]),
            { status: 200 },
          )
        }
        return new Response('[]', { status: 200 })
      }),
    )
    render(
      <MemoryRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Acme SARL')).toBeInTheDocument())
    expect(screen.getByText('Registered')).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run tests**

Run: `npm test src/pages/__tests__/dashboard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/DashboardPage.tsx src/routes/AppRoutes.tsx src/pages/__tests__/dashboard.test.tsx
git commit -m "feat(web): real client dashboard replacing grid mock"
```

---

### Task 7: Formation wizard (create → upload → checkout)

**Files:**
- Create: `src/pages/FormationWizardPage.tsx`
- Modify: `src/routes/AppRoutes.tsx` (`/formations/new` behind `ProtectedRoute`)
- Test: `src/pages/__tests__/formation-wizard.test.tsx`

**Interfaces:**
- Consumes: `apiPost<Formation>('/api/formations', ...)`, `apiUpload`, `apiPost('/api/formations/:id/checkout')`.
- Flow (single page, stepper state): Step 1 choose entity type (from `ENTITY_TYPES`) + company name + tier → creates formation (draft). Step 2 upload documents (`passport`, `address_proof`, `photo`) → POST documents. Step 3 review + "Pay & submit" → calls checkout, redirects `window.location.href = url`.

- [ ] **Step 1: Create `src/pages/FormationWizardPage.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ENTITY_TYPES, formatPrice } from '@/content/formations'
import { apiPost, apiUpload, ApiError } from '@/lib/api'
import type { EntityType, Formation, DocType } from '@/types/app'

const inputCls =
  'w-full rounded-lg border border-frost/15 bg-navy px-4 py-3 text-sm text-frost outline-none focus:border-teal-electric/50'

const DOC_FIELDS: { type: DocType; label: string }[] = [
  { type: 'passport', label: 'Passport' },
  { type: 'address_proof', label: 'Proof of address' },
  { type: 'photo', label: 'Passport photo' },
]

export default function FormationWizardPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [entityType, setEntityType] = useState<EntityType>('SARL')
  const [companyName, setCompanyName] = useState('')
  const [formation, setFormation] = useState<Formation | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function createFormation() {
    setError(''); setBusy(true)
    try {
      const f = await apiPost<Formation>('/api/formations', { entityType, companyName, packageTier: 'standard' })
      setFormation(f)
      setStep(2)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create formation')
    } finally { setBusy(false) }
  }

  async function uploadDoc(type: DocType, file: File) {
    if (!formation) return
    const form = new FormData()
    form.append('type', type)
    form.append('file', file)
    await apiUpload(`/api/formations/${formation._id}/documents`, form)
  }

  async function payAndSubmit() {
    if (!formation) return
    setBusy(true)
    try {
      const { url } = await apiPost<{ url: string }>(`/api/formations/${formation._id}/checkout`)
      window.location.href = url
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Checkout failed')
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <p className="text-sm text-frost/55">Step {step} of 3</p>

        {step === 1 && (
          <div className="mt-4 flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-frost">Choose your entity</h1>
            <div className="grid gap-3">
              {ENTITY_TYPES.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => setEntityType(e.value)}
                  className={`rounded-xl border px-5 py-4 text-left ${entityType === e.value ? 'border-teal-electric/50 bg-teal-electric/10' : 'border-frost/10 bg-steel/20'}`}
                >
                  <p className="font-medium text-frost">{e.label}</p>
                  <p className="text-sm text-frost/55">{e.blurb}</p>
                </button>
              ))}
            </div>
            <input className={inputCls} placeholder="Proposed company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            {error && <p className="text-sm text-indigo-pulse">{error}</p>}
            <Button disabled={!companyName || busy} onClick={createFormation}>Continue</Button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-frost">Upload your documents</h1>
            {DOC_FIELDS.map((d) => (
              <label key={d.type} className="flex flex-col gap-2 rounded-xl border border-frost/10 bg-steel/20 px-5 py-4">
                <span className="text-sm text-frost">{d.label}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="text-sm text-frost/70"
                  onChange={(e) => e.target.files?.[0] && uploadDoc(d.type, e.target.files[0])}
                />
              </label>
            ))}
            <Button onClick={() => setStep(3)}>Continue to payment</Button>
          </div>
        )}

        {step === 3 && formation && (
          <div className="mt-4 flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-frost">Review & pay</h1>
            <div className="rounded-xl border border-frost/10 bg-steel/20 p-5 text-frost">
              <p>{formation.companyName}</p>
              <p className="text-sm text-frost/55">{ENTITY_TYPES.find((e) => e.value === formation.entityType)?.label}</p>
              <p className="mt-3 text-xl font-semibold text-teal-electric">{formatPrice(formation.priceCents)}</p>
            </div>
            {error && <p className="text-sm text-indigo-pulse">{error}</p>}
            <Button disabled={busy} onClick={payAndSubmit}>{busy ? 'Redirecting…' : 'Pay & submit'}</Button>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Save & finish later</Button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Route in `src/routes/AppRoutes.tsx`** (inside the `ProtectedRoute` group)

```tsx
import FormationWizardPage from '@/pages/FormationWizardPage'
// ...
<Route path="/formations/new" element={<FormationWizardPage />} />
```

- [ ] **Step 3: Write the failing test `src/pages/__tests__/formation-wizard.test.tsx`**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import FormationWizardPage from '../FormationWizardPage'

afterEach(() => vi.restoreAllMocks())

describe('FormationWizardPage', () => {
  it('creates a formation and advances to upload step', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ _id: 'f1', entityType: 'SARL', companyName: 'Acme', packageTier: 'standard', priceCents: 49900, status: 'draft', paymentStatus: 'unpaid', statusHistory: [], createdAt: '' }), { status: 201 }),
      ),
    )
    render(
      <MemoryRouter>
        <FormationWizardPage />
      </MemoryRouter>,
    )
    await userEvent.type(screen.getByPlaceholderText('Proposed company name'), 'Acme')
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(await screen.findByText(/upload your documents/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run tests**

Run: `npm test src/pages/__tests__/formation-wizard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/FormationWizardPage.tsx src/routes/AppRoutes.tsx src/pages/__tests__/formation-wizard.test.tsx
git commit -m "feat(web): formation wizard (create, upload, checkout)"
```

---

### Task 8: Formation detail + status timeline

**Files:**
- Create: `src/pages/FormationDetailPage.tsx`
- Modify: `src/routes/AppRoutes.tsx` (`/formations/:id` behind `ProtectedRoute`)
- Test: `src/pages/__tests__/formation-detail.test.tsx`

**Interfaces:**
- Consumes: `apiGet<Formation>('/api/formations/:id')`, `apiGet<DocItem[]>('/api/formations/:id/documents')`.
- Renders: company header + `StatusBadge`, a documents list with per-doc status, and a vertical timeline from `statusHistory` (newest last) using `STATUS_LABEL`.

- [ ] **Step 1: Create `src/pages/FormationDetailPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { ENTITY_TYPES, STATUS_LABEL, formatPrice } from '@/content/formations'
import { apiGet } from '@/lib/api'
import type { Formation, DocItem, FormationStatus } from '@/types/app'

export default function FormationDetailPage() {
  const { id } = useParams()
  const [f, setF] = useState<Formation | null>(null)
  const [docs, setDocs] = useState<DocItem[]>([])

  useEffect(() => {
    if (!id) return
    apiGet<Formation>(`/api/formations/${id}`).then(setF).catch(() => setF(null))
    apiGet<DocItem[]>(`/api/formations/${id}/documents`).then(setDocs).catch(() => setDocs([]))
  }, [id])

  if (!f) return <div className="min-h-screen bg-navy pt-24 text-center text-frost/60">Loading…</div>

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-2xl px-5 py-12">
        <Link to="/dashboard" className="text-sm text-teal-electric">← Back to dashboard</Link>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-frost">{f.companyName}</h1>
            <p className="text-sm text-frost/55">
              {ENTITY_TYPES.find((e) => e.value === f.entityType)?.label} · {formatPrice(f.priceCents)}
            </p>
          </div>
          <StatusBadge status={f.status} />
        </div>

        <h2 className="mt-10 text-sm uppercase tracking-wider text-frost/50">Documents</h2>
        <div className="mt-3 grid gap-2">
          {docs.length === 0 && <p className="text-sm text-frost/55">No documents uploaded.</p>}
          {docs.map((d) => (
            <div key={d._id} className="flex justify-between rounded-lg border border-frost/10 bg-steel/20 px-4 py-3 text-sm">
              <span className="text-frost">{d.type} — {d.fileName}</span>
              <span className="text-frost/60">{d.status}</span>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-sm uppercase tracking-wider text-frost/50">Timeline</h2>
        <ol className="mt-3 border-l border-frost/15 pl-5">
          {f.statusHistory.map((h, i) => (
            <li key={i} className="relative pb-5">
              <span className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full bg-teal-electric" />
              <p className="text-frost">{STATUS_LABEL[h.status as FormationStatus] ?? h.status}</p>
              {h.note && <p className="text-sm text-frost/55">{h.note}</p>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Route in `src/routes/AppRoutes.tsx`** (inside `ProtectedRoute` group)

```tsx
import FormationDetailPage from '@/pages/FormationDetailPage'
// ...
<Route path="/formations/:id" element={<FormationDetailPage />} />
```

- [ ] **Step 3: Write the failing test `src/pages/__tests__/formation-detail.test.tsx`**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import FormationDetailPage from '../FormationDetailPage'

afterEach(() => vi.restoreAllMocks())

describe('FormationDetailPage', () => {
  it('shows company name and timeline', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/documents')) return new Response('[]', { status: 200 })
        return new Response(
          JSON.stringify({ _id: 'f1', entityType: 'SARL', companyName: 'Acme SARL', packageTier: 'standard', priceCents: 49900, status: 'in_review', paymentStatus: 'paid', statusHistory: [{ status: 'draft', at: '' }, { status: 'paid', at: '' }], createdAt: '' }),
          { status: 200 },
        )
      }),
    )
    render(
      <MemoryRouter initialEntries={['/formations/f1']}>
        <Routes>
          <Route path="/formations/:id" element={<FormationDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Acme SARL')).toBeInTheDocument())
    expect(screen.getByText('Paid')).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run tests**

Run: `npm test src/pages/__tests__/formation-detail.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/FormationDetailPage.tsx src/routes/AppRoutes.tsx src/pages/__tests__/formation-detail.test.tsx
git commit -m "feat(web): formation detail page with document list + timeline"
```

---

### Task 9: Admin console

**Files:**
- Create: `src/pages/AdminPage.tsx`
- Modify: `src/routes/AppRoutes.tsx` (`/admin` behind `AdminRoute`)
- Test: `src/pages/__tests__/admin.test.tsx`

**Interfaces:**
- Consumes: `apiGet<Formation[]>('/api/admin/formations')`, `apiPatch('/api/admin/formations/:id/status', { status, note })`.
- Renders a table of all formations (company, client email from populated `userId`, status badge) and, on selecting one, a control to advance status via the admin statuses (`in_review`, `filing_submitted`, `registered`, `needs_more_docs`, `rejected`). After patch, refetch the list.

- [ ] **Step 1: Create `src/pages/AdminPage.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { ENTITY_TYPES } from '@/content/formations'
import { apiGet, apiPatch } from '@/lib/api'
import type { Formation } from '@/types/app'

const ADMIN_STATUSES = ['in_review', 'filing_submitted', 'registered', 'needs_more_docs', 'rejected'] as const

function clientEmail(f: Formation): string {
  return typeof f.userId === 'object' && f.userId ? f.userId.email : '—'
}

export default function AdminPage() {
  const [items, setItems] = useState<Formation[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    setItems(await apiGet<Formation[]>('/api/admin/formations'))
  }
  useEffect(() => { load() }, [])

  async function advance(f: Formation, status: string) {
    setBusyId(f._id)
    try {
      await apiPatch(`/api/admin/formations/${f._id}/status`, { status })
      await load()
    } finally { setBusyId(null) }
  }

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="text-3xl font-semibold text-frost">Admin — Formations</h1>
        <div className="mt-8 grid gap-3">
          {items.map((f) => (
            <div key={f._id} className="rounded-xl border border-frost/10 bg-steel/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-frost">{f.companyName}</p>
                  <p className="text-sm text-frost/55">
                    {ENTITY_TYPES.find((e) => e.value === f.entityType)?.label} · {clientEmail(f)}
                  </p>
                </div>
                <StatusBadge status={f.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {ADMIN_STATUSES.map((s) => (
                  <Button key={s} size="sm" variant="outline" disabled={busyId === f._id} onClick={() => advance(f, s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Route in `src/routes/AppRoutes.tsx`**

```tsx
import AdminRoute from '@/components/auth/AdminRoute'
import AdminPage from '@/pages/AdminPage'
// ...
<Route element={<AdminRoute />}>
  <Route path="/admin" element={<AdminPage />} />
</Route>
```

- [ ] **Step 3: Write the failing test `src/pages/__tests__/admin.test.tsx`**

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminPage from '../AdminPage'

afterEach(() => vi.restoreAllMocks())

describe('AdminPage', () => {
  it('lists formations and patches status', async () => {
    const patch = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, opts?: RequestInit) => {
        if (opts?.method === 'PATCH') return patch()
        return new Response(
          JSON.stringify([
            { _id: 'f1', entityType: 'SARL', companyName: 'Acme SARL', packageTier: 'standard', priceCents: 49900, status: 'in_review', paymentStatus: 'paid', statusHistory: [], createdAt: '', userId: { _id: 'u1', email: 'c@x.com', fullName: 'C' } },
          ]),
          { status: 200 },
        )
      }),
    )
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Acme SARL')).toBeInTheDocument())
    expect(screen.getByText('c@x.com', { exact: false })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'registered' }))
    expect(patch).toHaveBeenCalled()
  })
})
```

- [ ] **Step 4: Run tests**

Run: `npm test src/pages/__tests__/admin.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminPage.tsx src/routes/AppRoutes.tsx src/pages/__tests__/admin.test.tsx
git commit -m "feat(web): admin console for reviewing + advancing formations"
```

---

### Task 10: Navbar auth links + full-suite green

**Files:**
- Modify: `src/components/layout/Navbar.tsx` (show Login/Dashboard/Admin/Logout based on `useAuth`)
- Test: full suite + typecheck

**Interfaces:**
- Consumes: `useAuth()`. Adds: when logged out → "Log in" link; when logged in → "Dashboard" (+ "Admin" if admin) + "Log out".

- [ ] **Step 1: Read `src/components/layout/Navbar.tsx`** to find where nav links render, then add an auth-aware cluster. Add at the end of the primary link group:

```tsx
import { useAuth } from '@/store/AuthContext'
// inside the component:
const { user, logout } = useAuth()
// in the JSX nav cluster:
{user ? (
  <>
    <Link to="/dashboard" className="text-sm text-frost/70 hover:text-frost">Dashboard</Link>
    {user.role === 'admin' && (
      <Link to="/admin" className="text-sm text-frost/70 hover:text-frost">Admin</Link>
    )}
    <button onClick={() => logout()} className="text-sm text-frost/70 hover:text-frost">Log out</button>
  </>
) : (
  <Link to="/login" className="text-sm text-teal-electric">Log in</Link>
)}
```
(Place consistent with the existing Navbar markup; reuse existing class patterns there if they differ.)

- [ ] **Step 2: Run the full suite + typecheck**

Run: `npm test && npm run build`
Expected: all tests PASS; `tsc` build succeeds with no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat(web): auth-aware navbar links"
```

---

## Manual Verification (full demo run, after both phases)

1. Backend: `cd server && npm run seed && npm run dev` (Mongo running, `.env` filled).
2. Frontend: `npm run dev` (proxies `/api` → 4000).
3. Visit `/signup` → register → receive verification email → click link → `/verify-email` shows success.
4. `/login` as the new user → redirected to `/dashboard`.
5. "Start new formation" → pick SARL → upload a PDF passport → "Pay & submit" → Stripe test checkout (card `4242 4242 4242 4242`) → back to dashboard, formation now `paid`.
6. Log in as `admin@chad.demo` / `Admin@123` → `/admin` → advance a formation to `registered`.
7. Back as the user → formation detail shows the updated timeline.

## Self-Review Notes (coverage vs spec)

- Login/Signup + email verification UI → Task 4. ✅
- Client dashboard (replaces grid mock) → Task 6. ✅
- Formation wizard: entity → details → docs → Stripe → tracking → Tasks 7, 8. ✅
- Admin dashboard: review docs, advance status → Task 9. ✅
- API client + AuthContext + guards → Tasks 2, 3. ✅
- Document upload UI → Task 7 (within wizard). ✅
- Shared status/entity metadata → Task 5. ✅
