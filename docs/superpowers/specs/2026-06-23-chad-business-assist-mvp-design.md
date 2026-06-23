# Chad Business-Assist — Demo MVP Backend Design

**Date:** 2026-06-23
**Status:** Approved (brainstorming)
**Goal:** A working demo of an online company-formation platform for Chad — user
signup, KYC document upload, payment, and an end-to-end formation workflow that can
process 3–5 sample company formations. The demo is shown to government for approval,
then hardened for launch.

---

## 1. Business Context

Operating model: **Model B — Managed Service brand** (BusinAssist-style). The platform
is the customer-facing brand; actual government filing is done manually by the operator
/ a local Chad agent during the demo phase, then progressively automated.

Chad legal reality (drives the data model and workflow):

- Companies follow **OHADA** law. Registration runs through **ANIE** (Agence Nationale
  des Investissements et des Exports), the one-stop shop (Guichet Unique).
- Common foreign-investor entity types: **SARL**, **SARL Unipersonnelle**, **SA**,
  **Branch (Succursale)**, **Representative Office**.
- A **registered office address in Chad** is mandatory before filing — this is the hook
  for the future "virtual office" upsell (out of scope for this MVP).
- **KYC / beneficial-ownership disclosure** is mandatory → document upload is core.
- Tax ID **NIF** is issued by ANIE during incorporation.

## 2. Scope

### In scope (this MVP / demo)
1. User signup / login (email + password).
2. KYC document upload (passport, address proof, photo, etc.).
3. Stripe **test-mode** payment (hosted Checkout).
4. Company-formation workflow with a real status state-machine, covering 5 Chad entity
   types (the "3–5 formations" demo).
5. Client dashboard: my formations, status timeline, document upload, start-new-formation
   wizard.
6. Admin dashboard: review all formations, approve/reject documents, advance status.
7. Seed script: 1 admin + 3–5 sample formations across different statuses.

### Out of scope (later / launch)
- Virtual office / registered-address product, mail handling.
- Mobile-money payments, live-capable card gateway (demo uses Stripe test mode).
- Recurring compliance billing, email/SMS notifications.
- Multi-language (FR/AR) content — marketing layer, handled separately.
- Real automated ANIE filing integration (manual during demo).

## 3. Architecture

Single repository. Existing Vite/React frontend is preserved; a new `/server` Node +
Express + TypeScript API is added.

```
chad_project/
├── src/                     # existing React frontend (marketing + new app pages)
└── server/                  # NEW: Express + TypeScript API
    ├── src/
    │   ├── routes/          # auth, formations, documents, payments, admin
    │   ├── models/          # Mongoose schemas
    │   ├── middleware/      # auth (JWT), upload (multer), error handler
    │   ├── lib/             # stripe client, db connection, config
    │   ├── seed.ts          # demo seed script
    │   └── index.ts         # Express app entry
    └── uploads/             # uploaded KYC docs (demo; gitignored)
```

- **Backend:** Node + Express + TypeScript.
- **Database:** **MongoDB** via **Mongoose** ODM. Demo: MongoDB Atlas free cluster or
  local `mongod`. Launch: same Atlas, scaled.
- **Frontend:** existing Vite/React SPA, with a small API client + auth context added.
- Frontend ↔ backend over JSON REST. Dev: Vite proxy `/api` → Express.

## 4. Data Model (MongoDB collections)

### User
| field | type | notes |
|-------|------|-------|
| _id | ObjectId | |
| email | string | unique, indexed |
| passwordHash | string | bcrypt |
| fullName | string | |
| country | string | user's home country |
| role | enum | `user` \| `admin` (default `user`) |
| createdAt | Date | |

### Formation (the order)
| field | type | notes |
|-------|------|-------|
| _id | ObjectId | |
| userId | ObjectId | ref User, indexed |
| entityType | enum | `SARL` \| `SARL_U` \| `SA` \| `BRANCH` \| `REP_OFFICE` |
| companyName | string | proposed name |
| packageTier | enum | `standard` \| `premium` (pricing tiers) |
| priceCents | number | amount in cents (USD for demo) |
| status | enum | see state machine below |
| paymentStatus | enum | `unpaid` \| `paid` |
| stripeSessionId | string | nullable |
| statusHistory | array | `[{ status, note, at }]` embedded timeline |
| createdAt | Date | |

### Document
| field | type | notes |
|-------|------|-------|
| _id | ObjectId | |
| formationId | ObjectId | ref Formation, indexed |
| userId | ObjectId | ref User |
| type | enum | `passport` \| `address_proof` \| `photo` \| `other` |
| fileName | string | original name |
| storagePath | string | path on disk (demo) |
| status | enum | `pending` \| `approved` \| `rejected` |
| uploadedAt | Date | |

## 5. Formation Status State Machine

```
draft
  → documents_submitted
  → payment_pending
  → paid
  → in_review
  → filing_submitted        (handed to ANIE)
  → registered  ✅
        ↘ needs_more_docs   (back to user)
        ↘ rejected
```

- User actions advance: draft → documents_submitted → payment_pending → paid.
- Admin actions advance: in_review → filing_submitted → registered, or bounce to
  needs_more_docs / rejected.
- Every transition appends to `statusHistory` for the timeline UI.

## 6. API Surface

Auth (JWT in httpOnly cookie):
- `POST /api/auth/signup` — { email, password, fullName, country }
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

Formations (auth required):
- `POST /api/formations` — create (entityType, companyName, packageTier)
- `GET  /api/formations` — list mine
- `GET  /api/formations/:id` — detail + documents + history
- `POST /api/formations/:id/submit` — move draft → documents_submitted

Documents (auth required):
- `POST /api/formations/:id/documents` — multipart upload (multer)
- `GET  /api/formations/:id/documents`

Payments:
- `POST /api/formations/:id/checkout` — create Stripe Checkout session, returns URL
- `POST /api/webhooks/stripe` — mark formation paid (raw body)

Admin (role=admin):
- `GET   /api/admin/formations` — all, filterable by status
- `PATCH /api/admin/formations/:id/status` — advance/bounce status
- `PATCH /api/admin/documents/:id` — approve/reject

## 7. Auth & Security

- Passwords hashed with **bcrypt**.
- **JWT** signed with server secret, stored in **httpOnly, SameSite cookie**.
- `requireAuth` middleware validates cookie; `requireAdmin` checks role.
- File uploads: type + size validation (images/PDF, e.g. ≤ 10 MB), stored under
  `server/uploads/` (gitignored). Storage is abstracted so it can swap to S3 at launch.
- Stripe webhook signature verified with the webhook secret.
- Secrets in `server/.env` (gitignored): `MONGODB_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET`, `CLIENT_URL`.

## 8. Frontend Additions (React)

- **Login** / **Signup** pages.
- **Client Dashboard** — replaces the leftover grid-template `DashboardPage`. Lists my
  formations with status badges; "Start new formation" CTA.
- **Formation Wizard** — step 1 entity type → step 2 company details → step 3 document
  upload → step 4 Stripe checkout → step 5 status tracking with timeline.
- **Admin Dashboard** — table of all formations; open one to review documents
  (approve/reject) and advance status.
- **API client** (fetch wrapper, credentials: include) + **AuthContext** (current user,
  login/logout, route guards).

## 9. Demo Seed

`server/src/seed.ts` creates:
- 1 admin user (known credentials) + 1–2 sample regular users.
- 3–5 formations across statuses: e.g. one `registered`, one `in_review`, one
  `documents_submitted`, one `draft` — so the full lifecycle is visible immediately when
  presenting to government.

## 10. Testing

- Backend: integration tests for auth (signup/login), formation create + status
  transitions, document upload, and the Stripe checkout/webhook path (mocked Stripe).
- Use an in-memory / disposable MongoDB for tests.
- Manual demo script: signup → create formation → upload docs → pay (Stripe test card
  4242…) → admin advances to registered.

## 11. Launch Hardening (post-demo, not now)

- Swap local-disk storage → S3-compatible bucket.
- Swap Stripe test → a Chad-capable gateway (e.g. Flutterwave) + mobile money.
- Add email notifications, FR/AR i18n, virtual-office product, real ANIE filing workflow.
- Production MongoDB Atlas tier, rate limiting, audit logging for compliance.
