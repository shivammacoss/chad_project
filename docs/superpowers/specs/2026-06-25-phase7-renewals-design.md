# Phase 7 — Renewals & Compliance Reminders Design

**Date:** 2026-06-25
**Status:** Design (Phase 7 of the full-platform roadmap)
**Goal:** Track company expiry, send renewal reminders at 90/60/30/7/1 days (in-app + email), and let customers start a renewal order. Recurring-revenue foundation.

## 1. Scope
Expiry tracking + a renewal-reminder check + renewal services + a "Renew" flow. The **admin-config** half of the roadmap's Phase 7 (services/prices/docs editable from an admin panel) is split into a separate later phase (7b) to keep this shippable. Real cron is deferred — the reminder check is a callable function exposed via an admin trigger (cron-ready).

## 2. Data model
`Application` gains:
- `expiresAt?: Date` — set when the certificate is issued (`registeredAt + 1 year`).
- `remindersSent: number[]` — thresholds already reminded (e.g. `[90, 60]`), to avoid duplicate reminders.
- `renewsApplicationId?: ObjectId` — on a renewal order, links back to the original company.

## 3. Renewal services (catalog)
Add two generic-flow services to the registry (`backend/src/lib/services.ts`):
- `annual-renewal` — "Annual Renewal & Filing" (category Compliance), priceCents e.g. 25000, intake `{ renewingCompany }`, docs `['other']`.
- `license-renewal` — "Business License Renewal" (Compliance), priceCents 20000.
These flow through the existing generic order pipeline (intake → docs → pay → invoice).

## 4. Renewal reminders
`backend/src/lib/renewals.ts` → `runRenewalReminders(now = new Date()): Promise<{ sent: number }>`:
- Finds applications with status `registered` and `expiresAt` set, where days-until-expiry ≤ a threshold in `[90, 60, 30, 7, 1]` and that threshold is not yet in `remindersSent`.
- For the smallest matching not-yet-sent threshold, calls `notifyUser(app.userId, { type:'status', title:'Renewal due', body:'{company} expires in {N} days — renew now.', link:'/applications/:id' })`, pushes the threshold into `remindersSent`, saves.
- Returns the count sent. Idempotent: running twice the same day sends nothing new.
Exposed via `POST /api/admin/run-renewal-check` (`requireAuth + requireAdmin`) → `{ sent }`. (A cron can call the same function later.)

## 5. Renew flow
- When the certificate is issued, set `expiresAt = registeredAt + 365 days`.
- Customer detail + dashboard show the expiry date for registered companies and a **"Renew"** button → creates an `annual-renewal` order (`POST /api/applications { serviceKey:'annual-renewal' }`) with `intake.renewingCompany = <company name>` and `renewsApplicationId = <original id>`, then navigates to the generic wizard `/services/:id` to pay. (Backend `POST /api/applications` accepts an optional `renewsApplicationId`.)

## 6. API
- `POST /api/applications` — additionally accepts optional `renewsApplicationId` (stored on the new order).
- `POST /api/admin/run-renewal-check` — admin trigger; returns `{ sent }`.
- (No other new endpoints; renewal orders reuse the generic order + invoice + checkout pipeline.)

## 7. Frontend
- **Customer**: on a `registered` application (detail + dashboard card), show "Expires: {date}" and a **Renew** button → create the renewal order then go to `/services/:id`.
- **Admin/staff console**: a **"Run renewal check"** button (admin only) → `POST /api/admin/run-renewal-check`, shows "{n} reminders sent". (For the demo, simulates the daily cron.)
- **Types**: `Application` gains `expiresAt?`, `remindersSent?`, `renewsApplicationId?`.

## 8. Seed
- Set the registered demo company's `expiresAt` to ~30 days out (so a single reminder check produces a "Renewal due" notification at the 30-day threshold).
- Keep the existing notifications/invoices seeds.

## 9. Out of scope (Phase 7b / later)
Admin-editable service catalog (services/prices/required-documents UI + DB), real scheduled cron, auto-renewal/auto-charge, multi-year terms, grace periods, recurring compliance subscriptions billing.

## 10. Testing
- Backend: `runRenewalReminders` sends one reminder for a company expiring in 30 days, marks the threshold, and a second run sends nothing; the renewal services appear in `/api/services`; `POST /api/applications { renewsApplicationId }` stores the link; admin trigger returns `{ sent }` and is admin-gated.
- Frontend: a registered application shows the expiry + Renew button; the admin console "Run renewal check" calls the endpoint.
