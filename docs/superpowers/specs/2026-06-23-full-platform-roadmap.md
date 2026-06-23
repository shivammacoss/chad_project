# Chad Business Platform — Full Roadmap (V3+)

**Date:** 2026-06-23
**Status:** Roadmap (captures the complete vision; each phase ships independently)
**Context:** V2 delivered the company-formation happy path (Get Started → KYC → pay → wizard → admin review). This roadmap turns the platform into the full "Business Assist for Chad" ERP — every landing service bookable, full internal team + government workflow, certificates, notifications, billing, renewals, support, audit, and multi-country config.

## Current baseline (V2, on `main`)
- Backend: Express + TS + MongoDB; models `User`, `Application`, `Document`; routes auth/applications/documents/payments/admin.
- Frontend: Vite/React; Get Started + login-only + 6-step formation wizard + dashboard + application detail; separate admin login + rich review.
- Roles: `user`, `admin`. Payment: Stripe test. Email: verification only.

## Architecture decision (gating)
The vision suggests Next.js + NestJS + Prisma + PostgreSQL + S3 + Redis/BullMQ. Current stack is Vite/React + Express + MongoDB + local storage. **Everything below can be built on the current stack.** A stack migration is a separate, large effort and is NOT required to deliver these features; revisit only when scaling to production. This roadmap assumes the current stack unless the user decides to migrate.

---

## Phase 1 — Service Catalog + Generalized Application  ⭐ (start here)
Make registration cover ALL landing services, not just formation.

- **Service registry** (configurable, admin-editable later): each service has `key`, `category`, `name`, `priceCents`, `requiredDocuments[]`, `intakeFields[]`. Seed the catalog from the landing menu (Company Formation types, Virtual Office packages, Business License, Accounting, Tax, Trademark, Bank Account, Annual Compliance, etc.).
- **Generalize `Application` → `Order`/`ServiceRequest`**: an order references a `serviceKey` and carries service-specific intake data. Company formation becomes one service type among many.
- **Get Started → service picker**: landing service cards + Get Started let the user choose any service; the wizard adapts its steps to the chosen service's `intakeFields` (formation = full wizard; virtual office = package + address; tax = company + tax type; etc.).
- **Pricing** driven by the service registry (per-service + add-ons).
- Dashboard lists all the user's service orders, grouped by service.

**Ships:** users can apply+pay for any landing service; formation is one of many.

## Phase 2 — Formation wizard depth + intake completeness
Bring the formation intake to the full 10-step spec.

- Separate **Shareholders** and **Directors** steps (currently combined "owners").
- **3 preferred company names**; **business activity dropdown** (Trading/IT/Consulting/Import-Export/Manufacturing/Construction…).
- **Capital**: share capital, paid-up capital, currency.
- Per-person fields: passport, national ID, DOB, photo, proof of address, signature, phone, email.
- **Company-shareholder** path: Certificate of Incorporation, Articles, Memorandum, Board Resolution, Register, Power of Attorney, Beneficial Ownership declaration.
- Document requirements **configurable per service** (admin panel, Phase 7).

**Ships:** legally-complete formation intake.

## Phase 3 — Internal team, roles & granular workflow
Turn the single `admin` into the real org.

- **Roles:** Super Admin, Sales, Legal, Compliance, Government Agent, Finance, Support, Customer — each with scoped permissions.
- **Granular statuses:** Draft → Waiting Payment → Payment Received → Pending Documents → Document Review → Legal Review → Waiting Government → Government Processing → Approved → Completed (+ Rejected).
- **Pipeline / assignment:** Sales → Legal → Compliance → Government Agent.
- **Legal panel:** approve/reject documents, request more docs, **reject reason + re-upload**, assign agent, generate forms.
- **Government Agent panel:** assigned cases, upload **certificate / government receipt / license**, remarks, mark complete.
- Document statuses gain a **rejection reason** + client re-upload loop.

**Ships:** real end-to-end internal + government workflow.

## Phase 4 — Certificates, file storage & document portal
- **Certificate module:** Certificate of Incorporation, Tax Certificate, Business License, Articles, Memorandum, Share Certificate, Government Receipt — issue, preview, download, print.
- **Structured storage:** Customer → Company → {Passport, Certificate, License, Invoices, Receipts}. (Move from flat disk to S3-compatible bucket here.)
- Client dashboard **Documents/Certificates** section with download.

**Ships:** certificate delivery + organized document portal.

## Phase 5 — Notifications + email automation
- **In-app notifications** (bell): certificate uploaded, payment pending, document rejected, renewal due.
- **Email triggers:** application submitted, payment success, documents rejected, company approved, certificate uploaded, renewal due. (Reuse existing Nodemailer; add a templated, queued sender.)
- Optional SMS later.

**Ships:** customers kept informed at every step.

## Phase 6 — Billing: invoices + payment providers
- **Invoices** auto-generated per order/renewal (download/print).
- **Payment providers:** add **Flutterwave** + **Bank Transfer** (manual confirm) alongside Stripe; provider abstraction.
- Dashboard **Invoices** + **Payments** history.

**Ships:** real billing with multiple rails + invoices.

## Phase 7 — Renewals, compliance & admin configuration
- **Renewal system:** company expiry tracking; reminders at 90/60/30/7/1 days (in-app + email); renewal orders (license renewal, annual filing).
- **Compliance:** monthly bookkeeping / tax filing as recurring services.
- **Admin configuration:** services, prices, required documents, statuses — editable in an admin panel (no code change).

**Ships:** recurring revenue + self-serviceable config.

## Phase 8 — Support, CRM & audit
- **Ticket system:** customer opens tickets (Legal/Payment/Documents/Technical/Other); staff respond.
- **CRM:** per-customer timeline (calls/emails/WhatsApp/notes).
- **Audit log:** every action — who, when, IP, old value → new value.

**Ships:** support + sales ops + compliance-grade traceability.

## Phase 9 — Country configuration (multi-country)
- Make the platform **country-configurable**: per country (Chad/UAE/Kenya/Nigeria/Rwanda…) its own company types, required documents, fees, processing time, government forms, compliance rules.
- Country switcher; all Phase-1 service definitions become country-scoped.

**Ships:** easy expansion beyond Chad.

---

## Suggested order & rationale
1. **Phase 1** (service catalog) — unlocks the whole platform; directly addresses "registration must cover all landing services."
2. **Phase 3** (internal team + government workflow) — the operational core the business runs on.
3. **Phase 4** (certificates) + **Phase 5** (notifications/emails) — close the loop to the customer.
4. **Phase 6** (billing) → **Phase 7** (renewals/config) → **Phase 8** (support/CRM/audit) → **Phase 2** depth + **Phase 9** multi-country as the platform matures.

Each phase = its own spec → plan → build cycle (like V1/V2), shippable on its own.
