# Phase 1 — Service Catalog + Generalized Application Design

**Date:** 2026-06-23
**Status:** Design (Phase 1 of the full-platform roadmap)
**Goal:** Make every landing-page service bookable through Get Started, driven by a single configurable service registry. Company formation becomes one service among many; other services use a lightweight intake flow.

## 1. Problem
Today an "Application" is hard-coded to company formation (entityType + owners + virtualOffice). The landing page advertises ~25 services across 5 categories, but a user can only register for formation. Phase 1 generalizes the order so any service can be applied for and paid, without losing the rich formation flow.

## 2. Approach
A **service registry** is the single source of truth (backend, exposed via an API; frontend fetches it). Each order references a `serviceKey`. Two intake flows:
- **`formation` flow** — the existing rich wizard (entity, company, owners, virtual office, KYC). Used by company-formation services.
- **`generic` flow** — a simple form built from the service's `intakeFields`, then KYC upload, then pay. Used by every other service (virtual office, business license, accounting, tax, trademark, bank account, annual compliance, etc.).

This keeps formation untouched while unlocking all other services with minimal per-service work.

## 3. Service Registry
`backend/src/lib/services.ts` exports `SERVICES: ServiceDef[]`:

```ts
interface ServiceField { name: string; label: string; type: 'text' | 'number' | 'select' | 'textarea'; options?: string[]; required?: boolean }
interface ServiceDef {
  key: string            // e.g. 'company-formation', 'virtual-office', 'accounting'
  category: string       // 'Company Formation' | 'Office Solutions' | 'Corporate Services' | 'Telecoms' | 'Tax & Accounting'
  name: string
  blurb: string
  priceCents: number     // base price (formation adds entity/tier/VO on top)
  flow: 'formation' | 'generic'
  intakeFields: ServiceField[]   // generic flow only (formation ignores)
  requiredDocuments: string[]    // doc types/labels the user must upload
}
```

Seed catalog (representative, expandable):
- **Company Formation** (`flow: formation`): `company-formation` (LLC/SARL, SA, Branch, Rep Office, NGO/Partnership via entityType).
- **Office Solutions** (`generic`): `virtual-office` (field: package basic/standard/premium; address preference), `registered-office`, `mail-handling`.
- **Corporate Services** (`generic`): `business-license`, `trademark`, `business-bank-account`, `annual-compliance`, `company-dissolution`.
- **Tax & Accounting** (`generic`): `accounting` (field: monthly turnover band), `tax-registration` (field: tax type — Tax ID / VAT).

Each generic service defines 2–4 intake fields + its required documents. Exact list is data, easily extended later (and admin-editable in roadmap Phase 7).

## 4. Data Model changes (`Application`)
Generalize without breaking formation:
- Add `serviceKey: string` (required; existing seed/formation rows default to `'company-formation'`).
- Add `serviceName: string` (denormalized for display).
- Add `intake: Map/Mixed` (generic-flow service data; empty for formation).
- Keep `entityType`, `companyDetails`, `owners`, `virtualOffice` — now **optional**, used only by the formation flow.
- `priceCents` set from the registry: generic = `service.priceCents`; formation = `totalPrice(entityType, tier, vo)` (unchanged).
- `status` machine, `paymentStatus`, documents, `statusHistory`, `currentStep` unchanged.

## 5. API
- `GET /api/services` — public; returns `SERVICES` (catalog for the frontend). No auth.
- `POST /api/applications` — body now `{ serviceKey, entityType?, packageTier? }`. For a `formation` service it behaves as today (needs entityType). For a `generic` service it creates the order priced from the registry, `intake: {}`.
- `PATCH /api/applications/:id` — for generic services, accepts `{ intake }` (validated loosely against the service's fields) in addition to the existing formation patches.
- Documents/payments/admin endpoints unchanged (already service-agnostic; they key off the order id).

## 6. Frontend
- `frontend/src/lib/services.ts` or a `useServices()` hook fetches `GET /api/services` (single source of truth). A small static fallback is fine for tests.
- **Get Started**: step 1 becomes a **service catalog** grouped by category (cards with name + price). Selecting a service:
  - `formation` → continue into the existing rich wizard (entity → company → owners → VO → KYC → pay).
  - `generic` → a **GenericServiceWizard**: step "details" (render `intakeFields`) → step "documents" (upload `requiredDocuments`) → step "review + pay".
- **Signup** still happens in Get Started before the intake (unchanged), OR right after service choice — keep current order (pick → signup → verify → resume).
- **Dashboard**: each order shows `serviceName` + status + price (works for all services).
- **Application/Order detail**: shows service-specific intake (formation shows owners/VO; generic shows intake fields) + documents + timeline.
- **Admin review**: shows `serviceName` + the order's intake (formation block or generic intake) + documents + status controls (unchanged controls).

## 7. Landing wiring
Landing service cards (from `menu.ts`) link to `/get-started?service=<key>` so the catalog preselects that service. The marketing pages stay; their CTA points into the catalog.

## 8. Out of scope (later phases)
Separate shareholders/directors & capital depth (Phase 2), roles/internal/government workflow (Phase 3), certificates (Phase 4), notifications/emails (Phase 5), invoices/providers (Phase 6), renewals/admin-config (Phase 7), tickets/CRM/audit (Phase 8), multi-country (Phase 9). Phase 1 only makes all services bookable + payable on the existing workflow.

## 9. Testing
- Backend: `GET /api/services` shape; create a generic-service order (priced from registry); PATCH intake; create a formation order still works; admin list shows serviceName.
- Frontend: catalog renders grouped services; selecting a generic service runs the generic wizard create→intake→pay; formation still routes to the rich wizard; dashboard shows serviceName.

## 10. Migration / back-compat
The V2 seed and any existing orders set `serviceKey='company-formation'`, `serviceName='Company Formation'`. No data loss; formation flow unchanged.
