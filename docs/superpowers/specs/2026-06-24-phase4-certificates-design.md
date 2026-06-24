# Phase 4 — Certificates & Document Portal Design

**Date:** 2026-06-24
**Status:** Design (Phase 4 of the full-platform roadmap)
**Goal:** Issue a **system-generated Certificate of Incorporation (PDF)** when a company is registered, assign a registration number, and give the customer a clean Certificates section to download/print it — alongside the agent-uploaded official documents from Phase 3.

## 1. Scope
Certificate **generation** (real PDF) + registration number + a customer download/print portal. Structured cloud storage (S3) is **deferred** — files stay on local disk, organised per application; the move to S3 is a later infra task. Phase 3 already lets the government agent upload certificate/receipt/license files; Phase 4 adds the platform-issued, auto-generated certificate.

## 2. Data model
`Application` gains:
- `companyRegNo?: string` — assigned at issuance, e.g. `RCCM/NDJ/2026/B-0042`.
- `registeredAt?: Date` — when the certificate was issued.

## 3. Certificate generation
- Dependency: **`pdfkit`** (pure-JS, no native deps; built-in Helvetica font).
- `backend/src/lib/certificate.ts` → `generateCertificatePdf(app, user): Promise<Buffer>` renders a Certificate of Incorporation containing: platform header, "Republic of Chad — Certificate of Incorporation", company name, entity type, registration number, incorporation date, registered office (city), share + paid-up capital, and the list of shareholders (with %) and directors. Clean, printable A4 layout.

## 4. API
Staff (issue):
- `POST /api/staff/applications/:id/issue-certificate` (`requireStaff`) — if no `companyRegNo`, assign one (`RCCM/NDJ/<year>/B-<seq>` where seq = count of registered apps + 1), set `registeredAt = now`, set status → `registered` (via pushStatus), generate the PDF, write it to disk under `uploads/<appId>/certificate.pdf`, and upsert a `Document` (type `certificate`, fileName `certificate-of-incorporation.pdf`, status `approved`). Idempotent: re-issuing regenerates the file and reuses the existing regNo. Returns the updated application.

Customer/staff (download):
- `GET /api/applications/:id/certificate.pdf` (`requireAuth`, owner-or-staff) — streams the generated certificate PDF inline (regenerates on the fly from current data so it always reflects the latest, with `Content-Type: application/pdf`). 404 if the app has no `companyRegNo` yet (not issued).

The existing per-document file route (`GET /api/applications/:id/documents/:docId/file`) continues to serve the stored certificate file and the agent-uploaded official docs.

## 5. Frontend
- **Staff panels** (LegalPanel + AgentPanel): an **"Issue certificate"** button on the open application → `POST .../issue-certificate`, then refetch. Shows the assigned `companyRegNo` once issued.
- **Customer** ApplicationDetailPage + DashboardPage:
  - A **Certificates** section: if `companyRegNo` is set, show the company registration number and a **Download / Print certificate** link to `/api/applications/:id/certificate.pdf` (opens in a new tab → browser can print/save as PDF). Also list the official documents (certificate/government_receipt/license types) with View links (already present from Phase 3) under the same section.
  - Show `companyRegNo` + `registeredAt` in the header when present.
- **Types**: `Application` gains `companyRegNo?: string`, `registeredAt?: string`.

## 6. File organisation (light "structured storage")
Generated certificates are written under `uploads/<appId>/certificate.pdf` (per-application folder), not the flat timestamped scheme used for user uploads. This is the lightweight version of the roadmap's Customer→Company folder structure; full S3 + per-customer tree is deferred.

## 7. Out of scope (later)
S3/cloud storage migration, invoice PDFs (Phase 6), tax/share certificates as separate generated documents (only Certificate of Incorporation is generated here; others remain agent-uploaded), notifications/emails on issuance (Phase 5), templated multi-document generation.

## 8. Testing
- Backend: `generateCertificatePdf` returns a non-empty Buffer starting with the `%PDF` magic bytes; `issue-certificate` assigns a regNo + creates the certificate Document + sets registeredAt; `GET certificate.pdf` 404s before issuance and returns a PDF after; non-owner non-staff blocked.
- Frontend: detail shows the certificate download link when `companyRegNo` is set and hides it otherwise; staff panel "Issue certificate" button calls the endpoint.
