# Phase 9 — Multi-Country Configuration Design

**Date:** 2026-06-25
**Status:** Design (Phase 9 — final roadmap phase)
**Goal:** Make the platform country-configurable: a country registry, country-scoped services, a country selector in the customer flow, and country tagging on orders. Builds on the DB-backed catalog (Phase 7b).

## 1. Scope
A `Country` registry + a `country` field on services + a country selector that filters the catalog + `country` on applications. Per-country company types/docs/fees are expressed as **country-scoped service entries** (each service belongs to one country). Chad (`TD`) is the default and existing data; UAE (`AE`) and Kenya (`KE`) are seeded as examples.

## 2. Data model
- New `Country` collection: `code` (e.g. `TD`, unique), `name`, `flag` (emoji, optional), `active` (default true).
- `Service` gains `country: { type: String, default: 'TD' }` (service keys stay globally unique; country tags + filters them).
- `Application` gains `country: { type: String, default: 'TD' }` (set from the chosen service's country at create).

## 3. Backend
- Seed countries: `TD` (Chad 🇹🇩), `AE` (UAE 🇦🇪), `KE` (Kenya 🇰🇪). `GET /api/countries` (public, active only).
- `seedServicesIfEmpty` tags existing code services with `country: 'TD'` and seeds a couple non-TD example services (e.g. `uae-company-formation` country `AE`, `kenya-company-formation` country `KE`, both generic flow).
- `listServices(activeOnly, country?)` filters by `country` when provided. `GET /api/services?country=TD` (defaults to `TD` if omitted, or returns all if `country=all`).
- Application create: set `app.country = service.country`.
- Admin service CRUD accepts/returns `country` (so admins assign a service to a country).

## 4. Frontend
- **Country selector** at the top of Get Started (and the in-app StartService catalog): a dropdown of `GET /api/countries`; default Chad. Changing it refetches `GET /api/services?country=<code>` so only that country's services show.
- The chosen country flows naturally because the order is created from a country-scoped service; the customer never picks a separate country field.
- **Display**: application detail + admin + dashboard show the country (flag + name) for the order.
- **Admin ServicesPanel**: show each service's country and allow setting it on create.
- **Types**: `Country`; `Application.country?`; `AdminService.country`.

## 5. Seed
Countries TD/AE/KE; the TD catalog (existing) plus one example service each for AE and KE; the demo applications keep `country: 'TD'`.

## 6. Out of scope
Per-country legal-rule engines, currency/locale per country, country-specific document-requirement editors beyond the service's `requiredDocuments`, translated content (FR/AR). This phase delivers the configurable country structure + selector + scoping.

## 7. Testing
- Backend: `GET /api/countries` returns active countries; `GET /api/services?country=AE` returns only AE services; creating an order from an AE service sets `application.country='AE'`; admin can create a service with a country.
- Frontend: the country selector lists countries and filters the catalog; detail/admin show the order country.
