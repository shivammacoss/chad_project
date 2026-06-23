# Chad Formation Platform — V2 Design (BusinessAssist-depth)

**Date:** 2026-06-23
**Status:** Approved (brainstorming)
**Supersedes the UX/flow of:** `2026-06-23-chad-business-assist-mvp-design.md` (V1).
V1 proved the plumbing (auth, email verify, document upload, Stripe, status workflow,
admin). V2 turns it into a real product with the correct flows and the depth a
government demo needs.

## 1. Why V2

V1 shipped a thin skeleton. Concrete gaps the user identified:

1. **Registration in the wrong place.** Signup lived on the login page. It must start
   from the landing page ("Get Started" / plan selection), not from `/login`.
2. **Admin not separated.** Admin and user shared one login. Admin must have its own
   login (`/admin/login`) and area (`/admin/*`). (This also removes the V1 redirect
   confusion.)
3. **No depth after login.** A user could only pick an entity, type a company name, and
   upload a file. A real formation needs: company details, one-or-many owners/directors
   with shareholding, a virtual-office add-on, and per-owner KYC.
4. **Folder layout unclear.** The frontend sits at the repo root with the backend nested
   in `server/`. V2 separates them cleanly.

## 2. Scope

**In scope:** ONE service — **company formation** — built to real depth, plus the correct
auth/registration flows, a separate admin area, and a folder restructure.

**Out of scope (marketing pages only, not functional):** virtual office as a standalone
product, phone numbers, accounting, trademark, banking, compliance subscriptions. The
virtual office appears only as an **add-on** inside the formation flow, not its own
product.

## 3. Folder Restructure

One repository, two clearly separated apps:

```
chad_project/
├── frontend/          ← the Vite/React app (everything currently at repo root: src/, index.html, vite.config.ts, package.json, tailwind.config.ts, public/, etc.)
├── backend/           ← the Express + Mongo API (current server/ renamed)
└── docs/              ← specs and plans (unchanged)
```

- All current root-level frontend files move under `frontend/`.
- `server/` is renamed to `backend/`.
- `git mv` is used so history is preserved.
- The leftover `rendr/` template folder is deleted (dead weight).
- Root keeps only `docs/`, `.git`, a top-level `README.md`, and `.gitignore`.
- Dev: run backend (`cd backend && npm run dev`, port 4000) and frontend
  (`cd frontend && npm run dev`, port 5173, `/api` proxied to 4000).

## 4. Auth & Registration Flow

### User registration (from the landing page)
1. Landing page shows entity/plan cards and a **"Get Started"** CTA.
2. "Get Started" (or choosing a plan) → **`/get-started`**: pick entity type + package →
   **create account** (signup: fullName, email, country, phone, password) → email
   verification sent.
3. After verifying + logging in, the user lands in the **application wizard** pre-seeded
   with the chosen entity/package, to fill the rest.
4. **`/login`** is login-only. It links to "Get Started" for new users — no signup form
   on the login page.

### Admin (separate)
- **`/admin/login`** — its own page, styled distinctly, posts to the same
  `/api/auth/login` but the page only forwards admins onward (a non-admin who logs in
  here is shown "this account is not an admin" and is not let into `/admin`).
- **`/admin/*`** routes are guarded by an `AdminRoute` that, when not an admin, redirects
  to `/admin/login` (not `/dashboard`) — so the admin area is fully self-contained.
- Same JWT cookie mechanism; the only change is dedicated admin entry/guarding.

## 5. Rich Formation Application (the core)

A user has one or more **Applications** (formerly "Formation"). The wizard has these steps;
each step saves to the Application so it can be resumed:

1. **Entity & package** — entity type (`SARL|SARL_U|SA|BRANCH|REP_OFFICE`) + tier
   (`standard|premium`). (Pre-filled from Get Started.)
2. **Company details** — proposed name (primary + 1 alternate), business activity/sector,
   share capital (FCFA), intended registered city (default N'Djamena).
3. **Owners / Directors** — add **one or many** people. Each owner: `fullName`,
   `role` (`director|shareholder|both`), `nationality`, `ownershipPercent`, `email`
   (optional), `isPrimaryContact` (one must be true). Client-side validation: shareholder
   percentages should total 100.
4. **Virtual office add-on** — "Do you need a registered office address in Chad?"
   yes/no; if yes, choose a plan (`basic|premium`). Adds to price.
5. **KYC documents** — upload per owner: passport, address proof, photo. Documents are
   linked to the specific owner.
6. **Review & pay** — summary of everything; price = entity base + tier + virtual office;
   "Pay & submit" → Stripe Checkout (test).
7. **Track** — status timeline (existing state machine), documents and their review state.

## 6. Backend Data Model (MongoDB / Mongoose)

### User (extend)
Add `phone: string` (optional). Existing fields unchanged.

### Application (extends/renames the V1 Formation collection)
| field | type | notes |
|-------|------|-------|
| _id | ObjectId | |
| userId | ObjectId | ref User, indexed |
| entityType | enum | `SARL\|SARL_U\|SA\|BRANCH\|REP_OFFICE` |
| packageTier | enum | `standard\|premium` |
| companyDetails | object | `{ proposedName, alternateName?, businessActivity, shareCapitalFCFA, city }` |
| owners | array | `[{ fullName, role: 'director'\|'shareholder'\|'both', nationality, ownershipPercent, email?, isPrimaryContact }]` |
| virtualOffice | object | `{ wanted: boolean, plan?: 'basic'\|'premium' }` |
| priceCents | number | entity + tier + virtual-office add-on |
| status | enum | unchanged 9-value state machine |
| paymentStatus | enum | `unpaid\|paid` |
| stripeSessionId | string | nullable |
| statusHistory | array | `[{ status, note?, at }]` |
| currentStep | number | wizard resume pointer (1–7) |
| createdAt | Date | |

### Document (extend)
Add `ownerName: string` (which owner this KYC belongs to) and keep
`type` (`passport|address_proof|photo|other`), `status`, `storagePath`, etc.

### Pricing
`priceFor(entityType, tier)` (existing base) **plus** virtual-office add-on:
`basic` +20000 cents, `premium` +50000 cents (demo values). Total stored on the
Application at submit/checkout time.

## 7. API Surface (delta from V1)

Reused unchanged: `/api/auth/*` (signup now takes `phone`), `/api/auth/me`, logout,
document upload (`POST /api/applications/:id/documents` now accepts `ownerName`),
Stripe checkout + webhook, admin status PATCH.

New / changed:
- `POST /api/applications` — create from Get Started (entityType, packageTier).
- `PATCH /api/applications/:id` — save a wizard step (companyDetails, owners,
  virtualOffice, currentStep); recomputes priceCents.
- `GET /api/applications` / `GET /api/applications/:id` — include owners + virtualOffice.
- `GET /api/admin/applications` — full applications populated with user + owners.
- `PATCH /api/admin/documents/:id` — approve/reject (existing).
(The route base renames `formations` → `applications` for clarity.)

## 8. Frontend Structure (after restructure, under `frontend/src`)

- **Pages:** `Landing/HomePage` (Get Started + plans), `GetStartedPage` (pick + signup),
  `LoginPage` (login-only), `VerifyEmailPage`, `DashboardPage` (my applications),
  `ApplicationWizardPage` (7 steps), `ApplicationDetailPage` (track + docs + timeline),
  `AdminLoginPage`, `AdminPage` (full review).
- **Wizard steps** as focused components under `components/application/` (one file per
  step) so each is small and testable.
- **Reused:** `Button`, `Badge`, `StatusBadge`, `AuthContext`, `api` client, types
  (extended for owners/virtualOffice), `ProtectedRoute`, a reworked `AdminRoute`.

## 9. Admin Area (real review)

`/admin/login` → `/admin`: a list of all applications; opening one shows the full
application — company details, **every owner with role + shareholding %**, virtual-office
choice, and **per-owner documents** with view/approve/reject — plus controls to advance
status (in_review → filing_submitted → registered, or needs_more_docs / rejected).
Document file viewing requires a guarded download route
(`GET /api/applications/:id/documents/:docId/file`, owner-or-admin only).

## 10. Reuse vs Rebuild

- **Reuse (~70%):** backend auth, email verification, Stripe, document upload, status
  state machine, JWT/cookies; frontend design system, AuthContext, api client.
- **Rebuild:** registration flow (Get Started), the wizard (3-step basic → 7-step rich),
  admin (status-only → full review + separate login), data model (flat → company +
  owners[] + virtualOffice), folder restructure.

## 11. Demo Seed

1 admin (`admin@chad.demo` / `Admin@123`) + 2 users, each with complete applications:
multi-owner (2–3 owners with shareholding), virtual office chosen, per-owner KYC docs,
spread across statuses (registered, in_review, draft) — so the demo shows rich, realistic
data immediately.

## 12. Testing

- Backend: integration tests for application create + step saves (owners/virtualOffice +
  price recompute), per-owner document upload, admin full-review fetch, and the document
  download guard (owner-or-admin only). Reuse the in-memory Mongo harness.
- Frontend: tests for Get Started signup, the owners step (add/remove multiple, percent
  total), wizard step persistence, and admin review render.

## 13. Launch Hardening (carried over, still post-demo)

Async error wrappers on routes, multer upgrade, short-lived admin tokens, split-domain
cookie config (`sameSite:'none'; secure`), FR/AR i18n, real ANIE filing integration,
Chad-capable payment gateway + mobile money.
