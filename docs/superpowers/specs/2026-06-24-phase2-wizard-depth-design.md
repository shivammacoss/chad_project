# Phase 2 — Formation Wizard Depth Design

**Date:** 2026-06-24
**Status:** Design (Phase 2 of the full-platform roadmap)
**Goal:** Bring the company-formation intake to the full legal spec — 3 preferred names, business-activity dropdown, capital details, and **separate Shareholders and Directors** steps with richer per-person fields (including a corporate-shareholder path). The generic-service flow and Phase-3 staff workflow are untouched.

## 1. Scope
Formation flow only. Other services (generic flow) unchanged. No new roles/statuses.

## 2. Data model changes
### `companyDetails` (Application)
Add: `alternateName2?: string` (so there are 3 names: `proposedName` + `alternateName` + `alternateName2`), `paidUpCapitalFCFA?: number`, `currency?: string` (default `'FCFA'`). Keep `businessActivity` (now chosen from a fixed list on the frontend), `shareCapitalFCFA`, `city`.

### Person (the `owners[]` sub-schema)
The owners array continues to hold everyone; the wizard now adds people through two distinct steps that set the right `role`. Enrich the sub-schema with optional fields:
`phone?`, `address?`, `passportNo?`, `idNumber?`, `dob?` (string, ISO date), `isCorporate?` (boolean, shareholders only).
- A **Shareholder** entry: `role: 'shareholder'` (or `'both'`), `ownershipPercent`, plus passport/nationality/email/phone/address, optional `isCorporate`.
- A **Director** entry: `role: 'director'` (or `'both'`), `dob`, plus passport/nationality/email/phone/address.
Existing V2/seed data (role + ownershipPercent) stays valid; new fields are optional.

## 3. Wizard steps (formation)
1. **Entity & package** (unchanged).
2. **Company details** — proposed name + 2 alternates (3 total), **business activity dropdown** (Trading, IT, Consulting, Import/Export, Manufacturing, Construction, Agriculture, Services, Other), share capital, paid-up capital, currency (default FCFA), city.
3. **Shareholders** — add one or many; each: full name, `isCorporate` checkbox, nationality, ownership %, passport no, email, phone, address. Live shareholding total (warn if ≠ 100). Saves as `owners` with `role: 'shareholder'`.
4. **Directors** — add one or many; each: full name, nationality, DOB, passport no, email, phone, address. Saves and is **merged** into `owners` with `role: 'director'`.
5. **KYC documents** — per person (shareholders + directors): passport, photo, proof of address, signature. If any shareholder `isCorporate`, also show corporate documents: Certificate of Incorporation, Articles/Memorandum, Board Resolution, Register of Directors/Shareholders. Each uploads via the existing per-order document endpoint with `ownerName` = the person/company name.
6. **Review & pay** — summary (company, shareholders + %, directors, capital, VO) → Stripe checkout (unchanged).

Implementation note: steps 3 and 4 both contribute to the single `owners[]` array. The wizard keeps two local lists (shareholders, directors) and on save composes `owners = [...shareholders(role shareholder), ...directors(role director)]`, persisted via the existing `PATCH /api/applications/:id { owners }`. A person who is both is entered in both lists (acceptable for the demo) or marked `role: 'both'` if added as a shareholder who is also a director (a checkbox "also a director").

## 4. Backend changes
- Extend the `owners` sub-schema and `companyDetails` in `backend/src/models/Application.ts` with the optional fields above. No route changes needed — `PATCH` already accepts `owners` and `companyDetails` and shallow-merges them; `recompute()` is unaffected.
- Seed: enrich one formation application's owners with the new fields (dob on a director, passportNo, phone) and set paidUp/currency, so the richer data shows in admin/detail.

## 5. Frontend changes
- **Shared content** (`content/formations.ts`): add `BUSINESS_ACTIVITIES: string[]` and `CURRENCIES: string[]`.
- **Types** (`types/app.ts`): extend `Owner` with the optional fields; extend `CompanyDetails` with `alternateName2?`, `paidUpCapitalFCFA?`, `currency?`.
- **Components**: split the single owners step into `ShareholdersStep` and `DirectorsStep` (each a controlled list editor, reusing the add/remove pattern from the current `OwnersStep`). `OwnersStep` can be removed or kept for back-compat.
- **`ApplicationWizardPage`**: becomes 6 steps (entity → company details → shareholders → directors → KYC → review). Company-details step renders the activity dropdown + capital fields. KYC step iterates the combined people and conditionally shows corporate docs.
- **Detail + admin**: already iterate `owners` and show role + %. Extend to show the extra person fields when present (dob, phone) and group by role ("Shareholders" / "Directors"). Minimal, additive.

## 6. Out of scope (later phases)
Per-service configurable document requirements (Phase 7 admin config), real certificate generation (Phase 4), notifications (Phase 5). Phase 2 is intake depth only.

## 7. Testing
- Backend: Application accepts enriched owners (dob, passportNo, isCorporate) + companyDetails (paidUp, currency, alternateName2) via PATCH; seed still green.
- Frontend: ShareholdersStep adds a shareholder with ownership %, DirectorsStep adds a director with DOB; wizard composes `owners` from both and advances; company-details step renders the activity dropdown.
