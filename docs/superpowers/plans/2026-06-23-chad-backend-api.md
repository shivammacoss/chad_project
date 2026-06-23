# Chad Business-Assist — Backend API Implementation Plan (Phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Node/Express + MongoDB API for the Chad company-formation demo — auth with email verification, KYC document upload, Stripe test-mode payment, the formation workflow, admin processing, and a demo seed.

**Architecture:** A standalone `/server` Express + TypeScript app in the existing repo. MongoDB via Mongoose. JWT in an httpOnly cookie for auth. Multer for file uploads to local disk. Nodemailer (provider-agnostic SMTP) for email verification. Stripe hosted Checkout for payments. The existing Vite/React frontend is untouched in this phase (wired up in Phase 2).

**Tech Stack:** Node 18+, Express 4, TypeScript, Mongoose 8, bcryptjs, jsonwebtoken, cookie-parser, multer, stripe, nodemailer, dotenv, cors. Tests: Vitest + Supertest + mongodb-memory-server. Run with `tsx`.

## Global Constraints

- All server code lives under `server/`. Do not modify `src/` (frontend) in this phase.
- Language: TypeScript, ES modules (`"type": "module"` in `server/package.json`).
- Entity types (exact enum values): `SARL`, `SARL_U`, `SA`, `BRANCH`, `REP_OFFICE`.
- Formation statuses (exact): `draft`, `documents_submitted`, `payment_pending`, `paid`, `in_review`, `filing_submitted`, `registered`, `needs_more_docs`, `rejected`.
- Document types (exact): `passport`, `address_proof`, `photo`, `other`.
- Roles (exact): `user`, `admin`.
- Currency for demo: USD, amounts stored as integer cents (`priceCents`).
- Secrets only via `server/.env` (gitignored). Never commit real keys.
- Every task ends green (tests pass) and is committed.

---

### Task 1: Server scaffold + health endpoint

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/.gitignore`
- Create: `server/.env.example`
- Create: `server/src/app.ts`
- Create: `server/src/index.ts`
- Create: `server/vitest.config.ts`
- Test: `server/src/__tests__/health.test.ts`
- Modify: root `.gitignore` (add `server/node_modules`, `server/uploads`, `server/.env`)

**Interfaces:**
- Produces: `createApp(): Express` from `server/src/app.ts` — the Express app factory used by both the server entry and all tests (so tests never bind a port).

- [ ] **Step 1: Create `server/package.json`**

```json
{
  "name": "chad-server",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "tsx src/index.ts",
    "seed": "tsx src/seed.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.5.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.14",
    "stripe": "^16.5.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cookie-parser": "^1.4.7",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.16.11",
    "@types/nodemailer": "^6.4.15",
    "@types/supertest": "^6.0.2",
    "mongodb-memory-server": "^10.0.0",
    "supertest": "^7.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.2",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `server/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["node"],
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `server/.gitignore`**

```
node_modules
dist
.env
uploads
```

- [ ] **Step 4: Create `server/.env.example`**

```
MONGODB_URI=mongodb://127.0.0.1:27017/chad_dev
JWT_SECRET=change-me-in-production
CLIENT_URL=http://localhost:5173
PORT=4000
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-pass
EMAIL_FROM="Chad Business Assist <no-reply@example.com>"
```

- [ ] **Step 5: Create `server/src/app.ts`**

```ts
import express, { type Express } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

export function createApp(): Express {
  const app = express()

  app.use(
    cors({
      origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
      credentials: true,
    }),
  )
  // Stripe webhook needs the raw body; it is mounted before express.json() in Task 8.
  app.use(express.json())
  app.use(cookieParser())

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  return app
}
```

- [ ] **Step 6: Create `server/src/index.ts`**

```ts
import 'dotenv/config'
import { createApp } from './app.js'
import { connectDb } from './lib/db.js'

const PORT = Number(process.env.PORT ?? 4000)

async function main() {
  await connectDb(process.env.MONGODB_URI!)
  const app = createApp()
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error('Fatal startup error', err)
  process.exit(1)
})
```

Note: `./lib/db.js` is created in Task 2. If running `dev` before Task 2, it will error — that is expected; tests in this task do not import `index.ts`.

- [ ] **Step 7: Create `server/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
  },
})
```

- [ ] **Step 8: Write the failing test `server/src/__tests__/health.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(createApp()).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })
})
```

- [ ] **Step 9: Install deps and run the test to verify it fails then passes**

Run:
```bash
cd server && npm install && npm test
```
Expected: the health test PASSES (app.ts already implements it). If `npm install` is the first run, this also confirms toolchain works.

- [ ] **Step 10: Update root `.gitignore`**

Append:
```
server/node_modules
server/uploads
server/.env
server/dist
```

- [ ] **Step 11: Commit**

```bash
git add server .gitignore
git commit -m "feat(server): scaffold express+ts api with health endpoint"
```

---

### Task 2: MongoDB connection + test harness

**Files:**
- Create: `server/src/lib/db.ts`
- Create: `server/src/__tests__/setup.ts`
- Test: `server/src/__tests__/db.test.ts`
- Modify: `server/vitest.config.ts` (register global setup)

**Interfaces:**
- Produces: `connectDb(uri: string): Promise<typeof mongoose>` and `disconnectDb(): Promise<void>` from `server/src/lib/db.ts`.
- Produces: a Vitest global setup that starts an in-memory MongoDB for the whole test run and clears collections between tests.

- [ ] **Step 1: Create `server/src/lib/db.ts`**

```ts
import mongoose from 'mongoose'

export async function connectDb(uri: string): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  return mongoose
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect()
}
```

- [ ] **Step 2: Create `server/src/__tests__/setup.ts`**

```ts
import { afterAll, afterEach, beforeAll } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { connectDb, disconnectDb } from '../lib/db.js'

let mongo: MongoMemoryServer

beforeAll(async () => {
  mongo = await MongoMemoryServer.create()
  await connectDb(mongo.getUri())
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({})
  }
})

afterAll(async () => {
  await disconnectDb()
  await mongo.stop()
})
```

- [ ] **Step 3: Register setup in `server/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
})
```

- [ ] **Step 4: Write the failing test `server/src/__tests__/db.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import mongoose from 'mongoose'

describe('database connection', () => {
  it('is connected during tests', () => {
    expect(mongoose.connection.readyState).toBe(1)
  })
})
```

- [ ] **Step 5: Run tests**

Run: `cd server && npm test`
Expected: both health and db tests PASS.

- [ ] **Step 6: Commit**

```bash
git add server
git commit -m "feat(server): mongodb connection + in-memory test harness"
```

---

### Task 3: User model

**Files:**
- Create: `server/src/models/User.ts`
- Test: `server/src/__tests__/user.model.test.ts`

**Interfaces:**
- Produces: Mongoose model `User` with `IUser` fields: `email: string` (unique, lowercased), `passwordHash: string`, `fullName: string`, `country: string`, `role: 'user'|'admin'`, `emailVerified: boolean`, `emailVerifyToken?: string|null`, `emailVerifyExpires?: Date|null`, `createdAt: Date`. Default `role='user'`, `emailVerified=false`.

- [ ] **Step 1: Create `server/src/models/User.ts`**

```ts
import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  country: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  emailVerified: { type: Boolean, default: false },
  emailVerifyToken: { type: String, default: null },
  emailVerifyExpires: { type: Date, default: null },
  createdAt: { type: Date, default: () => new Date() },
})

export type IUser = InferSchemaType<typeof userSchema>
export const User = mongoose.model('User', userSchema)
```

- [ ] **Step 2: Write the failing test `server/src/__tests__/user.model.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { User } from '../models/User.js'

describe('User model', () => {
  it('creates a user with defaults', async () => {
    const u = await User.create({
      email: 'A@Example.com',
      passwordHash: 'x',
      fullName: 'Test',
      country: 'India',
    })
    expect(u.email).toBe('a@example.com') // lowercased
    expect(u.role).toBe('user')
    expect(u.emailVerified).toBe(false)
  })

  it('enforces unique email', async () => {
    const base = { passwordHash: 'x', fullName: 'T', country: 'IN' }
    await User.create({ email: 'dup@x.com', ...base })
    await expect(User.create({ email: 'dup@x.com', ...base })).rejects.toThrow()
  })
})
```

- [ ] **Step 3: Run tests**

Run: `cd server && npm test src/__tests__/user.model.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add server
git commit -m "feat(server): user model"
```

---

### Task 4: Auth helpers (password + JWT + tokens)

**Files:**
- Create: `server/src/lib/auth.ts`
- Test: `server/src/__tests__/auth.lib.test.ts`

**Interfaces:**
- Produces from `server/src/lib/auth.ts`:
  - `hashPassword(plain: string): Promise<string>`
  - `verifyPassword(plain: string, hash: string): Promise<boolean>`
  - `signToken(payload: { sub: string; role: string }): string`
  - `verifyToken(token: string): { sub: string; role: string }`
  - `makeVerifyToken(): { raw: string; hashed: string; expires: Date }`
  - `hashToken(raw: string): string`

- [ ] **Step 1: Create `server/src/lib/auth.ts`**

```ts
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createHash, randomBytes } from 'node:crypto'

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

function secret(): string {
  return process.env.JWT_SECRET ?? 'test-secret'
}

export function signToken(payload: { sub: string; role: string }): string {
  return jwt.sign(payload, secret(), { expiresIn: '7d' })
}

export function verifyToken(token: string): { sub: string; role: string } {
  return jwt.verify(token, secret()) as { sub: string; role: string }
}

export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

export function makeVerifyToken(): { raw: string; hashed: string; expires: Date } {
  const raw = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
  return { raw, hashed: hashToken(raw), expires }
}
```

- [ ] **Step 2: Write the failing test `server/src/__tests__/auth.lib.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  makeVerifyToken,
  hashToken,
} from '../lib/auth.js'

describe('auth lib', () => {
  it('hashes and verifies passwords', async () => {
    const h = await hashPassword('secret123')
    expect(await verifyPassword('secret123', h)).toBe(true)
    expect(await verifyPassword('wrong', h)).toBe(false)
  })

  it('signs and verifies jwt', () => {
    const t = signToken({ sub: 'abc', role: 'user' })
    expect(verifyToken(t).sub).toBe('abc')
  })

  it('makes a verify token whose raw hashes to the stored value', () => {
    const { raw, hashed } = makeVerifyToken()
    expect(hashToken(raw)).toBe(hashed)
  })
})
```

- [ ] **Step 3: Run tests**

Run: `cd server && npm test src/__tests__/auth.lib.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add server
git commit -m "feat(server): auth helpers (bcrypt, jwt, verify tokens)"
```

---

### Task 5: Email sending (Nodemailer wrapper)

**Files:**
- Create: `server/src/lib/email.ts`
- Test: `server/src/__tests__/email.test.ts`

**Interfaces:**
- Produces from `server/src/lib/email.ts`:
  - `sendVerificationEmail(to: string, link: string): Promise<void>`
  - `__setTransport(t: Transport): void` — test seam to inject a fake transport.
  Default transport is built lazily from SMTP env vars via Nodemailer.

- [ ] **Step 1: Create `server/src/lib/email.ts`**

```ts
import nodemailer from 'nodemailer'

interface Transport {
  sendMail(opts: {
    from: string
    to: string
    subject: string
    html: string
  }): Promise<unknown>
}

let transport: Transport | null = null

export function __setTransport(t: Transport): void {
  transport = t
}

function getTransport(): Transport {
  if (transport) return transport
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  return transport
}

export async function sendVerificationEmail(to: string, link: string): Promise<void> {
  await getTransport().sendMail({
    from: process.env.EMAIL_FROM ?? 'no-reply@example.com',
    to,
    subject: 'Verify your email — Chad Business Assist',
    html: `<p>Welcome! Confirm your email to activate your account:</p>
           <p><a href="${link}">Verify my email</a></p>
           <p>This link expires in 24 hours.</p>`,
  })
}
```

- [ ] **Step 2: Write the failing test `server/src/__tests__/email.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest'
import { sendVerificationEmail, __setTransport } from '../lib/email.js'

describe('email', () => {
  it('sends a verification email through the transport', async () => {
    const sendMail = vi.fn().mockResolvedValue({})
    __setTransport({ sendMail })
    await sendVerificationEmail('u@x.com', 'http://link/verify?token=abc')
    expect(sendMail).toHaveBeenCalledOnce()
    const arg = sendMail.mock.calls[0][0]
    expect(arg.to).toBe('u@x.com')
    expect(arg.html).toContain('http://link/verify?token=abc')
  })
})
```

- [ ] **Step 3: Run tests**

Run: `cd server && npm test src/__tests__/email.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add server
git commit -m "feat(server): nodemailer verification email wrapper"
```

---

### Task 6: Auth middleware

**Files:**
- Create: `server/src/middleware/auth.ts`
- Test: covered via route tests in Task 7 (middleware is exercised end-to-end there).

**Interfaces:**
- Produces from `server/src/middleware/auth.ts`:
  - `requireAuth(req, res, next)` — reads JWT from the `token` cookie, sets `req.userId` and `req.userRole`, else 401.
  - `requireAdmin(req, res, next)` — 403 unless `req.userRole === 'admin'`.
  - Augments Express `Request` with `userId?: string` and `userRole?: string`.

- [ ] **Step 1: Create `server/src/middleware/auth.ts`**

```ts
import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/auth.js'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string
      userRole?: string
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }
  try {
    const payload = verifyToken(token)
    req.userId = payload.sub
    req.userRole = payload.role
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Admin only' })
    return
  }
  next()
}
```

- [ ] **Step 2: Commit**

```bash
git add server
git commit -m "feat(server): auth + admin middleware"
```

---

### Task 7: Auth routes (signup, verify, login, me, logout)

**Files:**
- Create: `server/src/routes/auth.ts`
- Modify: `server/src/app.ts` (mount `/api/auth`)
- Test: `server/src/__tests__/auth.routes.test.ts`

**Interfaces:**
- Consumes: `User`, auth lib, `sendVerificationEmail`, `requireAuth`.
- Produces: router mounted at `/api/auth` with:
  - `POST /signup` { email, password, fullName, country } → 201, creates unverified user, emails link `${CLIENT_URL}/verify-email?token=RAW`.
  - `GET /verify-email?token=` → 200 sets `emailVerified=true`, clears token; 400 if invalid/expired.
  - `POST /resend-verification` { email } → 200 (always, to avoid user enumeration); re-emails if unverified.
  - `POST /login` { email, password } → 200 sets `token` httpOnly cookie; 401 bad creds; 403 if unverified.
  - `GET /me` (requireAuth) → { id, email, fullName, country, role }.
  - `POST /logout` → clears cookie, 200.

- [ ] **Step 1: Create `server/src/routes/auth.ts`**

```ts
import { Router } from 'express'
import { User } from '../models/User.js'
import {
  hashPassword,
  verifyPassword,
  signToken,
  makeVerifyToken,
  hashToken,
} from '../lib/auth.js'
import { sendVerificationEmail } from '../lib/email.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = Router()

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

authRouter.post('/signup', async (req, res) => {
  const { email, password, fullName, country } = req.body ?? {}
  if (!email || !password || !fullName || !country) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  const existing = await User.findOne({ email: String(email).toLowerCase() })
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const { raw, hashed, expires } = makeVerifyToken()
  await User.create({
    email,
    passwordHash: await hashPassword(password),
    fullName,
    country,
    emailVerifyToken: hashed,
    emailVerifyExpires: expires,
  })
  const link = `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/verify-email?token=${raw}`
  await sendVerificationEmail(String(email), link)
  res.status(201).json({ ok: true, message: 'Verification email sent' })
})

authRouter.get('/verify-email', async (req, res) => {
  const raw = String(req.query.token ?? '')
  if (!raw) return res.status(400).json({ error: 'Missing token' })
  const user = await User.findOne({
    emailVerifyToken: hashToken(raw),
    emailVerifyExpires: { $gt: new Date() },
  })
  if (!user) return res.status(400).json({ error: 'Invalid or expired token' })
  user.emailVerified = true
  user.emailVerifyToken = null
  user.emailVerifyExpires = null
  await user.save()
  res.json({ ok: true })
})

authRouter.post('/resend-verification', async (req, res) => {
  const email = String(req.body?.email ?? '').toLowerCase()
  const user = await User.findOne({ email })
  if (user && !user.emailVerified) {
    const { raw, hashed, expires } = makeVerifyToken()
    user.emailVerifyToken = hashed
    user.emailVerifyExpires = expires
    await user.save()
    const link = `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/verify-email?token=${raw}`
    await sendVerificationEmail(email, link)
  }
  res.json({ ok: true }) // always 200 — no enumeration
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  const user = await User.findOne({ email: String(email ?? '').toLowerCase() })
  if (!user || !(await verifyPassword(String(password ?? ''), user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  if (!user.emailVerified) {
    return res.status(403).json({ error: 'Please verify your email first' })
  }
  const token = signToken({ sub: String(user._id), role: user.role })
  res.cookie('token', token, COOKIE_OPTS)
  res.json({ id: user._id, email: user.email, fullName: user.fullName, role: user.role })
})

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('email fullName country role')
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json({
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    country: user.country,
    role: user.role,
  })
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token')
  res.json({ ok: true })
})
```

- [ ] **Step 2: Mount router in `server/src/app.ts`**

Add import and mount after `cookieParser`:
```ts
import { authRouter } from './routes/auth.js'
// ...
app.use('/api/auth', authRouter)
```

- [ ] **Step 3: Write the failing test `server/src/__tests__/auth.routes.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { __setTransport } from '../lib/email.js'
import { User } from '../models/User.js'
import { hashToken } from '../lib/auth.js'

const app = createApp()
let lastLink = ''

beforeEach(() => {
  __setTransport({
    sendMail: vi.fn(async (opts: { html: string }) => {
      lastLink = opts.html.match(/token=([a-f0-9]+)/)?.[1] ?? ''
    }),
  })
})

async function signup() {
  return request(app).post('/api/auth/signup').send({
    email: 'jo@x.com',
    password: 'secret123',
    fullName: 'Jo',
    country: 'India',
  })
}

describe('auth routes', () => {
  it('signs up and sends a verification link', async () => {
    const res = await signup()
    expect(res.status).toBe(201)
    expect(lastLink).toMatch(/^[a-f0-9]+$/)
  })

  it('blocks login until verified, then allows it', async () => {
    await signup()
    const blocked = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jo@x.com', password: 'secret123' })
    expect(blocked.status).toBe(403)

    const verify = await request(app).get(`/api/auth/verify-email?token=${lastLink}`)
    expect(verify.status).toBe(200)

    const ok = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jo@x.com', password: 'secret123' })
    expect(ok.status).toBe(200)
    expect(ok.headers['set-cookie'][0]).toContain('token=')
  })

  it('rejects an invalid verify token', async () => {
    const res = await request(app).get('/api/auth/verify-email?token=deadbeef')
    expect(res.status).toBe(400)
  })

  it('me returns the current user after login', async () => {
    await signup()
    const u = await User.findOne({ email: 'jo@x.com' })
    u!.emailVerified = true
    u!.emailVerifyToken = null
    await u!.save()
    const agent = request.agent(app)
    await agent.post('/api/auth/login').send({ email: 'jo@x.com', password: 'secret123' })
    const me = await agent.get('/api/auth/me')
    expect(me.status).toBe(200)
    expect(me.body.email).toBe('jo@x.com')
  })
})
```

- [ ] **Step 4: Run tests**

Run: `cd server && npm test src/__tests__/auth.routes.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add server
git commit -m "feat(server): auth routes with email verification + jwt cookie"
```

---

### Task 8: Formation model + routes

**Files:**
- Create: `server/src/models/Formation.ts`
- Create: `server/src/lib/pricing.ts`
- Create: `server/src/routes/formations.ts`
- Modify: `server/src/app.ts` (mount `/api/formations`)
- Test: `server/src/__tests__/formations.routes.test.ts`

**Interfaces:**
- Produces `Formation` model: `userId: ObjectId`, `entityType` (enum), `companyName: string`, `packageTier: 'standard'|'premium'`, `priceCents: number`, `status` (enum, default `draft`), `paymentStatus: 'unpaid'|'paid'` (default `unpaid`), `stripeSessionId?: string|null`, `statusHistory: { status: string; note?: string; at: Date }[]`, `createdAt: Date`.
- Produces `priceFor(entityType, tier): number` (cents) in `lib/pricing.ts`.
- Produces helper `pushStatus(formation, status, note?)` exported from `routes/formations.ts` — appends history and sets status. (Reused by admin + payments.)
- Routes (all `requireAuth`, scoped to `req.userId`):
  - `POST /api/formations` { entityType, companyName, packageTier } → 201 created in `draft`.
  - `GET /api/formations` → list mine, newest first.
  - `GET /api/formations/:id` → one of mine (404 otherwise).
  - `POST /api/formations/:id/submit` → `draft`→`documents_submitted` (400 if not draft).

- [ ] **Step 1: Create `server/src/lib/pricing.ts`**

```ts
export type EntityType = 'SARL' | 'SARL_U' | 'SA' | 'BRANCH' | 'REP_OFFICE'
export type Tier = 'standard' | 'premium'

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
```

- [ ] **Step 2: Create `server/src/models/Formation.ts`**

```ts
import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const statusEntry = new Schema(
  {
    status: { type: String, required: true },
    note: { type: String },
    at: { type: Date, default: () => new Date() },
  },
  { _id: false },
)

const formationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  entityType: {
    type: String,
    enum: ['SARL', 'SARL_U', 'SA', 'BRANCH', 'REP_OFFICE'],
    required: true,
  },
  companyName: { type: String, required: true },
  packageTier: { type: String, enum: ['standard', 'premium'], default: 'standard' },
  priceCents: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      'draft',
      'documents_submitted',
      'payment_pending',
      'paid',
      'in_review',
      'filing_submitted',
      'registered',
      'needs_more_docs',
      'rejected',
    ],
    default: 'draft',
  },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  stripeSessionId: { type: String, default: null },
  statusHistory: { type: [statusEntry], default: [] },
  createdAt: { type: Date, default: () => new Date() },
})

export type IFormation = InferSchemaType<typeof formationSchema>
export const Formation = mongoose.model('Formation', formationSchema)
```

- [ ] **Step 3: Create `server/src/routes/formations.ts`**

```ts
import { Router } from 'express'
import type { HydratedDocument } from 'mongoose'
import { Formation, type IFormation } from '../models/Formation.js'
import { priceFor, type EntityType, type Tier } from '../lib/pricing.js'
import { requireAuth } from '../middleware/auth.js'

export function pushStatus(
  formation: HydratedDocument<IFormation>,
  status: string,
  note?: string,
): void {
  formation.status = status as IFormation['status']
  formation.statusHistory.push({ status, note, at: new Date() })
}

export const formationsRouter = Router()
formationsRouter.use(requireAuth)

formationsRouter.post('/', async (req, res) => {
  const { entityType, companyName, packageTier } = req.body ?? {}
  const valid: EntityType[] = ['SARL', 'SARL_U', 'SA', 'BRANCH', 'REP_OFFICE']
  if (!valid.includes(entityType)) return res.status(400).json({ error: 'Invalid entityType' })
  if (!companyName) return res.status(400).json({ error: 'companyName required' })
  const tier: Tier = packageTier === 'premium' ? 'premium' : 'standard'

  const formation = await Formation.create({
    userId: req.userId,
    entityType,
    companyName,
    packageTier: tier,
    priceCents: priceFor(entityType, tier),
    statusHistory: [{ status: 'draft', at: new Date() }],
  })
  res.status(201).json(formation)
})

formationsRouter.get('/', async (req, res) => {
  const list = await Formation.find({ userId: req.userId }).sort({ createdAt: -1 })
  res.json(list)
})

formationsRouter.get('/:id', async (req, res) => {
  const f = await Formation.findOne({ _id: req.params.id, userId: req.userId })
  if (!f) return res.status(404).json({ error: 'Not found' })
  res.json(f)
})

formationsRouter.post('/:id/submit', async (req, res) => {
  const f = await Formation.findOne({ _id: req.params.id, userId: req.userId })
  if (!f) return res.status(404).json({ error: 'Not found' })
  if (f.status !== 'draft') return res.status(400).json({ error: 'Not in draft' })
  pushStatus(f, 'documents_submitted')
  await f.save()
  res.json(f)
})
```

- [ ] **Step 4: Mount in `server/src/app.ts`**

```ts
import { formationsRouter } from './routes/formations.js'
// ...
app.use('/api/formations', formationsRouter)
```

- [ ] **Step 5: Write the failing test `server/src/__tests__/formations.routes.test.ts`**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()

async function authedAgent() {
  await User.create({
    email: 'u@x.com',
    passwordHash: await hashPassword('secret123'),
    fullName: 'U',
    country: 'IN',
    emailVerified: true,
  })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'u@x.com', password: 'secret123' })
  return agent
}

describe('formations routes', () => {
  it('requires auth', async () => {
    const res = await request(app).get('/api/formations')
    expect(res.status).toBe(401)
  })

  it('creates a formation in draft with correct price', async () => {
    const agent = await authedAgent()
    const res = await agent
      .post('/api/formations')
      .send({ entityType: 'SARL', companyName: 'Acme SARL', packageTier: 'standard' })
    expect(res.status).toBe(201)
    expect(res.body.status).toBe('draft')
    expect(res.body.priceCents).toBe(49900)
    expect(res.body.statusHistory).toHaveLength(1)
  })

  it('submits a draft to documents_submitted', async () => {
    const agent = await authedAgent()
    const created = await agent
      .post('/api/formations')
      .send({ entityType: 'SA', companyName: 'Big SA' })
    const res = await agent.post(`/api/formations/${created.body._id}/submit`)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('documents_submitted')
  })

  it('rejects invalid entityType', async () => {
    const agent = await authedAgent()
    const res = await agent
      .post('/api/formations')
      .send({ entityType: 'LLC', companyName: 'x' })
    expect(res.status).toBe(400)
  })
})
```

- [ ] **Step 6: Run tests**

Run: `cd server && npm test src/__tests__/formations.routes.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add server
git commit -m "feat(server): formation model + CRUD routes + pricing"
```

---

### Task 9: Document upload

**Files:**
- Create: `server/src/models/Document.ts`
- Create: `server/src/middleware/upload.ts`
- Create: `server/src/routes/documents.ts`
- Modify: `server/src/routes/formations.ts` (mount nested document routes) OR mount in app — see step.
- Test: `server/src/__tests__/documents.routes.test.ts`

**Interfaces:**
- Produces `Document` model: `formationId`, `userId`, `type` (enum), `fileName: string`, `storagePath: string`, `status: 'pending'|'approved'|'rejected'` (default `pending`), `uploadedAt: Date`.
- Produces `upload` multer middleware (disk storage to `server/uploads/`, 10MB limit, images + pdf only).
- Routes (requireAuth, formation must belong to user):
  - `POST /api/formations/:id/documents` (multipart: field `file`, body `type`) → 201 document.
  - `GET /api/formations/:id/documents` → list for that formation.

- [ ] **Step 1: Create `server/src/models/Document.ts`**

```ts
import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const documentSchema = new Schema({
  formationId: { type: Schema.Types.ObjectId, ref: 'Formation', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['passport', 'address_proof', 'photo', 'other'], required: true },
  fileName: { type: String, required: true },
  storagePath: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: () => new Date() },
})

export type IDocument = InferSchemaType<typeof documentSchema>
export const DocumentModel = mongoose.model('Document', documentSchema)
```

- [ ] **Step 2: Create `server/src/middleware/upload.ts`**

```ts
import multer from 'multer'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const UPLOAD_DIR = join(process.cwd(), 'uploads')
mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`)
  },
})

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, ALLOWED.includes(file.mimetype))
  },
})
```

- [ ] **Step 3: Create `server/src/routes/documents.ts`**

```ts
import { Router } from 'express'
import { Formation } from '../models/Formation.js'
import { DocumentModel } from '../models/Document.js'
import { upload } from '../middleware/upload.js'
import { requireAuth } from '../middleware/auth.js'

// mergeParams so :id (formation id) from the parent mount is visible here
export const documentsRouter = Router({ mergeParams: true })
documentsRouter.use(requireAuth)

async function ownedFormation(userId: string | undefined, id: string) {
  return Formation.findOne({ _id: id, userId })
}

documentsRouter.post('/', upload.single('file'), async (req, res) => {
  const formation = await ownedFormation(req.userId, req.params.id)
  if (!formation) return res.status(404).json({ error: 'Formation not found' })
  if (!req.file) return res.status(400).json({ error: 'file required (jpg/png/webp/pdf, <=10MB)' })
  const type = ['passport', 'address_proof', 'photo', 'other'].includes(req.body?.type)
    ? req.body.type
    : 'other'

  const doc = await DocumentModel.create({
    formationId: formation._id,
    userId: req.userId,
    type,
    fileName: req.file.originalname,
    storagePath: req.file.path,
  })
  res.status(201).json(doc)
})

documentsRouter.get('/', async (req, res) => {
  const formation = await ownedFormation(req.userId, req.params.id)
  if (!formation) return res.status(404).json({ error: 'Formation not found' })
  const docs = await DocumentModel.find({ formationId: formation._id }).sort({ uploadedAt: 1 })
  res.json(docs)
})
```

- [ ] **Step 4: Mount nested router in `server/src/routes/formations.ts`**

At the bottom of the file, after the routes:
```ts
import { documentsRouter } from './documents.js'
formationsRouter.use('/:id/documents', documentsRouter)
```

- [ ] **Step 5: Write the failing test `server/src/__tests__/documents.routes.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()

async function setup() {
  await User.create({
    email: 'd@x.com',
    passwordHash: await hashPassword('secret123'),
    fullName: 'D',
    country: 'IN',
    emailVerified: true,
  })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'd@x.com', password: 'secret123' })
  const f = await agent
    .post('/api/formations')
    .send({ entityType: 'SARL', companyName: 'Acme' })
  return { agent, formationId: f.body._id as string }
}

describe('documents', () => {
  it('uploads and lists a document', async () => {
    const { agent, formationId } = await setup()
    const up = await agent
      .post(`/api/formations/${formationId}/documents`)
      .field('type', 'passport')
      .attach('file', Buffer.from('fake-pdf'), {
        filename: 'passport.pdf',
        contentType: 'application/pdf',
      })
    expect(up.status).toBe(201)
    expect(up.body.type).toBe('passport')
    expect(up.body.status).toBe('pending')

    const list = await agent.get(`/api/formations/${formationId}/documents`)
    expect(list.body).toHaveLength(1)
  })

  it('rejects upload with no file', async () => {
    const { agent, formationId } = await setup()
    const up = await agent
      .post(`/api/formations/${formationId}/documents`)
      .field('type', 'passport')
    expect(up.status).toBe(400)
  })
})
```

- [ ] **Step 6: Run tests**

Run: `cd server && npm test src/__tests__/documents.routes.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add server
git commit -m "feat(server): KYC document upload (multer) + routes"
```

---

### Task 10: Stripe checkout + webhook

**Files:**
- Create: `server/src/lib/stripe.ts`
- Create: `server/src/routes/payments.ts`
- Modify: `server/src/app.ts` (mount webhook with raw body BEFORE express.json; mount checkout under formations or its own path)
- Test: `server/src/__tests__/payments.routes.test.ts`

**Interfaces:**
- Produces `getStripe()` and `__setStripe(fake)` from `lib/stripe.ts` (test seam).
- `POST /api/formations/:id/checkout` (requireAuth, owns formation) → creates a Checkout Session, sets `status=payment_pending`, stores `stripeSessionId`, returns `{ url }`.
- `POST /api/webhooks/stripe` (raw body) → on `checkout.session.completed`, finds formation by `stripeSessionId`, sets `paymentStatus='paid'` and `status='paid'`, appends history.

- [ ] **Step 1: Create `server/src/lib/stripe.ts`**

```ts
import Stripe from 'stripe'

interface StripeLike {
  checkout: {
    sessions: {
      create(args: unknown): Promise<{ id: string; url: string | null }>
    }
  }
  webhooks: {
    constructEvent(body: Buffer, sig: string, secret: string): Stripe.Event
  }
}

let stripe: StripeLike | null = null

export function __setStripe(fake: StripeLike): void {
  stripe = fake
}

export function getStripe(): StripeLike {
  if (stripe) return stripe
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_dummy') as unknown as StripeLike
  return stripe
}
```

- [ ] **Step 2: Create `server/src/routes/payments.ts`**

```ts
import { Router, raw } from 'express'
import { Formation } from '../models/Formation.js'
import { getStripe } from '../lib/stripe.js'
import { requireAuth } from '../middleware/auth.js'
import { pushStatus } from './formations.js'

// Checkout creation — mounted under /api/formations/:id/checkout
export const checkoutRouter = Router({ mergeParams: true })
checkoutRouter.use(requireAuth)

checkoutRouter.post('/', async (req, res) => {
  const f = await Formation.findOne({ _id: req.params.id, userId: req.userId })
  if (!f) return res.status(404).json({ error: 'Not found' })

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `${f.entityType} formation — ${f.companyName}` },
          unit_amount: f.priceCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/dashboard?paid=1`,
    cancel_url: `${process.env.CLIENT_URL}/dashboard?canceled=1`,
  })

  f.stripeSessionId = session.id
  pushStatus(f, 'payment_pending')
  await f.save()
  res.json({ url: session.url })
})

// Webhook — mounted at /api/webhooks/stripe with a raw body parser.
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
    const f = await Formation.findOne({ stripeSessionId: session.id })
    if (f) {
      f.paymentStatus = 'paid'
      pushStatus(f, 'paid')
      await f.save()
    }
  }
  res.json({ received: true })
})
```

- [ ] **Step 3: Mount in `server/src/app.ts`**

The webhook must be registered with its raw parser. Mount the webhook router; since it sets its own `raw()` parser per-route, ordering relative to `express.json()` is safe, but mount it explicitly:
```ts
import { checkoutRouter, webhookRouter } from './routes/payments.js'
// ...
app.use('/api/webhooks/stripe', webhookRouter)
// and inside formations wiring (app already mounts formationsRouter):
```
Then in `server/src/routes/formations.ts`, mount checkout nested (next to documents):
```ts
import { checkoutRouter } from './payments.js'
formationsRouter.use('/:id/checkout', checkoutRouter)
```

- [ ] **Step 4: Write the failing test `server/src/__tests__/payments.routes.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { Formation } from '../models/Formation.js'
import { hashPassword } from '../lib/auth.js'
import { __setStripe } from '../lib/stripe.js'

const app = createApp()

beforeEach(() => {
  __setStripe({
    checkout: {
      sessions: {
        create: vi.fn(async () => ({ id: 'cs_test_123', url: 'https://stripe.test/pay' })),
      },
    },
    webhooks: {
      constructEvent: () =>
        ({
          type: 'checkout.session.completed',
          data: { object: { id: 'cs_test_123' } },
        }) as never,
    },
  })
})

async function setup() {
  await User.create({
    email: 'p@x.com',
    passwordHash: await hashPassword('secret123'),
    fullName: 'P',
    country: 'IN',
    emailVerified: true,
  })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'p@x.com', password: 'secret123' })
  const f = await agent.post('/api/formations').send({ entityType: 'SARL', companyName: 'Acme' })
  return { agent, id: f.body._id as string }
}

describe('payments', () => {
  it('creates a checkout session and sets payment_pending', async () => {
    const { agent, id } = await setup()
    const res = await agent.post(`/api/formations/${id}/checkout`)
    expect(res.status).toBe(200)
    expect(res.body.url).toBe('https://stripe.test/pay')
    const f = await Formation.findById(id)
    expect(f!.status).toBe('payment_pending')
    expect(f!.stripeSessionId).toBe('cs_test_123')
  })

  it('marks paid on webhook completion', async () => {
    const { id } = await setup()
    await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'sig')
      .set('Content-Type', 'application/json')
      .send(Buffer.from('{}'))
    const f = await Formation.findById(id)
    expect(f!.paymentStatus).toBe('paid')
    expect(f!.status).toBe('paid')
  })
})
```

Note: the checkout test must run before assertions about the webhook's target; the webhook test relies on the formation created in its own `setup()` having `stripeSessionId` set. Since the webhook looks up by `stripeSessionId='cs_test_123'`, call checkout first in that test. Adjust the second test to create the session first:

```ts
  it('marks paid on webhook completion', async () => {
    const { agent, id } = await setup()
    await agent.post(`/api/formations/${id}/checkout`) // sets stripeSessionId
    await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'sig')
      .set('Content-Type', 'application/json')
      .send(Buffer.from('{}'))
    const f = await Formation.findById(id)
    expect(f!.paymentStatus).toBe('paid')
  })
```

- [ ] **Step 5: Run tests**

Run: `cd server && npm test src/__tests__/payments.routes.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add server
git commit -m "feat(server): stripe checkout + webhook"
```

---

### Task 11: Admin routes

**Files:**
- Create: `server/src/routes/admin.ts`
- Modify: `server/src/app.ts` (mount `/api/admin`)
- Test: `server/src/__tests__/admin.routes.test.ts`

**Interfaces:**
- Consumes: `requireAuth`, `requireAdmin`, `Formation`, `DocumentModel`, `pushStatus`.
- Routes (requireAuth + requireAdmin):
  - `GET /api/admin/formations?status=` → all formations (optional filter), newest first, with user email populated.
  - `PATCH /api/admin/formations/:id/status` { status, note? } → validated transition, appends history.
  - `PATCH /api/admin/documents/:id` { status } → `approved`|`rejected`.

- [ ] **Step 1: Create `server/src/routes/admin.ts`**

```ts
import { Router } from 'express'
import { Formation } from '../models/Formation.js'
import { DocumentModel } from '../models/Document.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { pushStatus } from './formations.js'

const ADMIN_STATUSES = [
  'in_review',
  'filing_submitted',
  'registered',
  'needs_more_docs',
  'rejected',
]

export const adminRouter = Router()
adminRouter.use(requireAuth, requireAdmin)

adminRouter.get('/formations', async (req, res) => {
  const filter = req.query.status ? { status: String(req.query.status) } : {}
  const list = await Formation.find(filter)
    .sort({ createdAt: -1 })
    .populate('userId', 'email fullName')
  res.json(list)
})

adminRouter.patch('/formations/:id/status', async (req, res) => {
  const { status, note } = req.body ?? {}
  if (!ADMIN_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid admin status' })
  }
  const f = await Formation.findById(req.params.id)
  if (!f) return res.status(404).json({ error: 'Not found' })
  pushStatus(f, status, note)
  await f.save()
  res.json(f)
})

adminRouter.patch('/documents/:id', async (req, res) => {
  const { status } = req.body ?? {}
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  const doc = await DocumentModel.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  )
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
})
```

- [ ] **Step 2: Mount in `server/src/app.ts`**

```ts
import { adminRouter } from './routes/admin.js'
// ...
app.use('/api/admin', adminRouter)
```

- [ ] **Step 3: Write the failing test `server/src/__tests__/admin.routes.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { Formation } from '../models/Formation.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()

async function makeUser(role: 'user' | 'admin', email: string) {
  await User.create({
    email,
    passwordHash: await hashPassword('secret123'),
    fullName: role,
    country: 'IN',
    role,
    emailVerified: true,
  })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('admin routes', () => {
  it('forbids non-admins', async () => {
    const agent = await makeUser('user', 'u@x.com')
    const res = await agent.get('/api/admin/formations')
    expect(res.status).toBe(403)
  })

  it('lists all formations and advances status', async () => {
    const user = await makeUser('user', 'u@x.com')
    const created = await user
      .post('/api/formations')
      .send({ entityType: 'SARL', companyName: 'Acme' })
    const admin = await makeUser('admin', 'admin@x.com')

    const list = await admin.get('/api/admin/formations')
    expect(list.status).toBe(200)
    expect(list.body.length).toBe(1)

    const patched = await admin
      .patch(`/api/admin/formations/${created.body._id}/status`)
      .send({ status: 'registered', note: 'done' })
    expect(patched.status).toBe(200)
    expect(patched.body.status).toBe('registered')

    const f = await Formation.findById(created.body._id)
    expect(f!.statusHistory.at(-1)!.note).toBe('done')
  })
})
```

- [ ] **Step 4: Run tests**

Run: `cd server && npm test src/__tests__/admin.routes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server
git commit -m "feat(server): admin formation + document management routes"
```

---

### Task 12: Demo seed script

**Files:**
- Create: `server/src/seed.ts`
- Test: `server/src/__tests__/seed.test.ts`

**Interfaces:**
- Produces `seedDemo(): Promise<void>` — wipes Users/Formations, creates 1 admin (`admin@chad.demo` / `Admin@123`), 1 user (`user@chad.demo` / `User@123`, verified), and 4 formations across statuses (`registered`, `in_review`, `documents_submitted`, `draft`). `seed.ts` run directly also connects/disconnects.

- [ ] **Step 1: Create `server/src/seed.ts`**

```ts
import 'dotenv/config'
import { connectDb, disconnectDb } from './lib/db.js'
import { User } from './models/User.js'
import { Formation } from './models/Formation.js'
import { hashPassword } from './lib/auth.js'
import { priceFor } from './lib/pricing.js'

export async function seedDemo(): Promise<void> {
  await User.deleteMany({})
  await Formation.deleteMany({})

  const admin = await User.create({
    email: 'admin@chad.demo',
    passwordHash: await hashPassword('Admin@123'),
    fullName: 'Demo Admin',
    country: 'Chad',
    role: 'admin',
    emailVerified: true,
  })
  const user = await User.create({
    email: 'user@chad.demo',
    passwordHash: await hashPassword('User@123'),
    fullName: 'Demo User',
    country: 'India',
    role: 'user',
    emailVerified: true,
  })

  const specs: Array<{ entityType: 'SARL' | 'SA' | 'BRANCH'; name: string; status: string }> = [
    { entityType: 'SARL', name: 'Sahel Trading SARL', status: 'registered' },
    { entityType: 'SA', name: 'N’Djamena Holdings SA', status: 'in_review' },
    { entityType: 'BRANCH', name: 'Global Imports Branch', status: 'documents_submitted' },
    { entityType: 'SARL', name: 'Draft Co SARL', status: 'draft' },
  ]

  for (const s of specs) {
    await Formation.create({
      userId: user._id,
      entityType: s.entityType,
      companyName: s.name,
      packageTier: 'standard',
      priceCents: priceFor(s.entityType, 'standard'),
      status: s.status,
      paymentStatus: s.status === 'registered' || s.status === 'in_review' ? 'paid' : 'unpaid',
      statusHistory: [{ status: s.status, at: new Date() }],
    })
  }

  console.log('Seeded:', { admin: admin.email, user: user.email, formations: specs.length })
}

// Direct execution: `npm run seed`
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  connectDb(process.env.MONGODB_URI!)
    .then(seedDemo)
    .then(disconnectDb)
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}
```

- [ ] **Step 2: Write the failing test `server/src/__tests__/seed.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { seedDemo } from '../seed.js'
import { User } from '../models/User.js'
import { Formation } from '../models/Formation.js'

describe('seedDemo', () => {
  it('creates admin, user and demo formations', async () => {
    await seedDemo()
    expect(await User.countDocuments({ role: 'admin' })).toBe(1)
    expect(await Formation.countDocuments()).toBe(4)
    expect(await Formation.countDocuments({ status: 'registered' })).toBe(1)
  })
})
```

- [ ] **Step 3: Run tests**

Run: `cd server && npm test src/__tests__/seed.test.ts`
Expected: PASS.

- [ ] **Step 4: Run the full suite + typecheck**

Run: `cd server && npm test && npm run typecheck`
Expected: all tests PASS, no type errors.

- [ ] **Step 5: Commit**

```bash
git add server
git commit -m "feat(server): demo seed script"
```

---

## Manual Verification (after all tasks)

1. Start MongoDB (local `mongod` or set `MONGODB_URI` to an Atlas cluster).
2. `cd server && cp .env.example .env` and fill SMTP + Stripe test keys.
3. `npm run seed` then `npm run dev`.
4. `curl http://localhost:4000/api/health` → `{"ok":true}`.
5. Login as `admin@chad.demo` / `Admin@123` (after Phase 2 UI) — see 4 seeded formations.
6. Stripe webhook locally: `stripe listen --forward-to localhost:4000/api/webhooks/stripe`.

## Self-Review Notes (coverage vs spec)

- Auth + email verification → Tasks 4–7. ✅
- KYC document upload → Task 9. ✅
- Stripe test payment → Task 10. ✅
- Formation workflow + statuses → Tasks 8, 11. ✅
- Admin processing → Task 11. ✅
- Demo seed (3–5 formations, mixed statuses) → Task 12. ✅
- Frontend (login/dashboard/wizard/admin UI) → **Phase 2 plan** (separate document).
