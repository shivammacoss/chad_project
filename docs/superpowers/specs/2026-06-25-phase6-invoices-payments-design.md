# Phase 6 — Invoices & Payment Methods Design

**Date:** 2026-06-25
**Status:** Design (Phase 6 of the full-platform roadmap)
**Goal:** Auto-generate an invoice (PDF) per order, give customers a Payments/Invoices history with download, and add a **Bank Transfer** payment method (manual confirm) alongside Stripe behind a small provider abstraction.

## 1. Scope
Invoice records + invoice PDF generation + Payments/Invoices page + a Bank Transfer method (staff confirms). Stripe stays the working card method. **Flutterwave** is noted as a configurable future provider (a selectable-but-disabled option / "contact us"), not integrated. Redis/queue still deferred.

## 2. Data model
New `Invoice` collection (one per application, upserted at checkout):
| field | type | notes |
|---|---|---|
| _id | ObjectId | |
| invoiceNo | string | `INV/2026/0001` (assigned on creation) |
| applicationId | ObjectId | ref Application, indexed, unique |
| userId | ObjectId | ref User, indexed |
| serviceName | string | denormalized |
| amountCents | number | = app.priceCents at checkout |
| currency | string | `USD` (demo) |
| method | enum | `stripe` \| `bank_transfer` |
| status | enum | `unpaid` \| `paid` |
| issuedAt | Date | |
| paidAt | Date | nullable |

`Application` gains `paymentMethod?: 'stripe' | 'bank_transfer'`.

## 3. Invoice generation
`backend/src/lib/invoice.ts` → `generateInvoicePdf(invoice, app, applicantName): Promise<Buffer>` (pdfkit, same pattern as the certificate): header, invoice number + date, bill-to (applicant), a line item (serviceName + entity) with amount, total, and a payment-status stamp (PAID / UNPAID + method).

## 4. Checkout flow (extended)
`POST /api/applications/:id/checkout` accepts `{ method }` (default `stripe`):
- **Upsert an Invoice** for the application (invoiceNo assigned once; amount = `app.priceCents`; method = chosen; status unpaid). Set `app.paymentMethod`.
- **stripe**: create the Stripe Checkout session as today, set `payment_pending`, return `{ url, method:'stripe' }`.
- **bank_transfer**: do NOT create a Stripe session. Set `payment_pending`, return `{ method:'bank_transfer', invoiceNo, bankDetails }` (static demo bank details). The frontend shows the bank instructions and the invoice.

On payment confirmation the Invoice is marked paid:
- **Stripe webhook** `paid` → also set the application's invoice `status='paid', paidAt=now`.
- **Bank transfer** → staff confirms via `POST /api/staff/applications/:id/confirm-payment` (`requireStaff`): sets `paymentStatus='paid'`, `pushStatus('paid')`, marks the invoice paid, and `notifyUser` "Payment received".

## 5. API
- `GET /api/invoices` (auth, mine) — my invoices, newest first.
- `GET /api/invoices/:id/pdf` (auth, owner-or-staff) — stream the invoice PDF (regenerated).
- `POST /api/staff/applications/:id/confirm-payment` (staff) — bank-transfer manual confirm (above).
- Staff invoice visibility: `GET /api/staff/invoices` (optional) — all invoices; or reuse admin. (Include `GET /api/staff/invoices` for the staff finance view.)

## 6. Frontend
- **Checkout method selector** in both wizards (formation review step + generic review step): radio "Card (Stripe)" vs "Bank transfer". Card → existing redirect. Bank transfer → call checkout with `method:'bank_transfer'`, then show the returned bank details + invoice number and a link to the dashboard. (Flutterwave shown disabled "coming soon".)
- **Payments / Invoices page** (`/invoices`, ProtectedRoute): lists the user's invoices (invoiceNo, service, amount, status, method) with a **Download invoice** link to `/api/invoices/:id/pdf`. A nav link "Invoices" in the authenticated navbar / dashboard.
- **Types**: `Invoice` type; `Application.paymentMethod?`.
- **Staff finance**: optional small invoices list in the staff console (reuse the staff invoices endpoint) — minimal; can be deferred if time-constrained, but the confirm-payment action belongs on the Legal/Agent application view ("Confirm bank payment" button when method is bank_transfer and unpaid).

## 7. Seed
For the registered demo application, create a `paid` Stripe invoice (so the Invoices page shows a downloadable paid invoice). For one in-review app, an `unpaid` bank_transfer invoice.

## 8. Out of scope (later)
Real Flutterwave/mobile-money integration, partial payments, refunds, tax lines on invoices, recurring/renewal invoices (Phase 7), Redis queue.

## 9. Testing
- Backend: `generateInvoicePdf` returns a `%PDF` buffer; checkout upserts an invoice (idempotent invoiceNo); bank_transfer checkout returns bank details + no Stripe url; staff confirm-payment marks app + invoice paid + notifies; Stripe webhook marks the invoice paid; `GET /api/invoices` scoped to the user; invoice PDF owner-or-staff guard.
- Frontend: invoices page lists invoices with a download link; checkout method selector switches between card redirect and bank-transfer instructions.
