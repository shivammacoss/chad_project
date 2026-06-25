# Phase 7b — Admin Service-Catalog Config Design

**Date:** 2026-06-25
**Status:** Design (Phase 7b)
**Goal:** Move the service catalog from code to a DB collection so an admin can add/edit services, prices, required documents, and active status without a code change. Foundation for multi-country (Phase 9).

## 1. Scope
DB-backed `Service` catalog + admin CRUD + admin UI. `GET /api/services` and generic-order pricing read from the DB. The code `SERVICES` array becomes the **seed default**. Formation entity pricing (entity base + tier + VO) stays code-based; only the catalog list + generic-service pricing move to DB.

## 2. Data model
`Service` collection (mirrors the code `ServiceDef`): `key` (unique), `category`, `name`, `blurb`, `priceCents`, `flow` (`formation|generic`), `intakeFields` (Mixed array), `requiredDocuments` (string array), `active` (bool, default true), `createdAt`.

## 3. Backend
- `backend/src/lib/serviceStore.ts`:
  - `seedServicesIfEmpty()` — if the `Service` collection is empty, insert the code `SERVICES` (idempotent; called at startup + in seed).
  - `listServices(activeOnly = true): Promise<ServiceDef[]>` — from DB.
  - `getServiceDef(key): Promise<ServiceDef | null>` — from DB.
- `GET /api/services` → `listServices(true)` (after ensuring seeded). Falls back to code `SERVICES` if DB is unreachable.
- `applications.ts` POST → uses `getServiceDef(key)` for validation + generic pricing (async).
- Admin CRUD (`requireAdmin`): `GET /api/admin/services` (all incl. inactive), `POST /api/admin/services` (create), `PATCH /api/admin/services/:key` (update name/price/blurb/active/requiredDocuments). `logAudit` on each change.
- `seedServicesIfEmpty()` invoked in `seed.ts` and on server boot (`index.ts`), so the catalog exists.

## 4. Frontend
- **Admin ServicesPanel** (in `/staff`, admin only): a table of services (name, category, price, active) with inline edit of price + an active toggle (`PATCH`), and an "Add service" form (key, name, category, price, flow). Reads `GET /api/admin/services`.
- Types: `AdminService` (the full DB service shape).

## 5. Out of scope
Editing intake-field schemas in the UI (POST accepts them but the UI edits price/active/name/docs only), country scoping (Phase 9), versioning/history of config (audit log covers who-changed-what).

## 6. Testing
- Backend: `seedServicesIfEmpty` populates the catalog once; `GET /api/services` returns DB services; admin can create + toggle a service and it appears/disappears from the public catalog; pricing for a generic order reflects an admin-updated price; admin CRUD is admin-gated.
- Frontend: ServicesPanel lists services and toggles active.
