# Phase 3 — Internal Team, Roles & Government Workflow Design

**Date:** 2026-06-24
**Status:** Design (Phase 3 of the full-platform roadmap)
**Goal:** Turn the single `admin` into a real org with scoped roles, a granular status pipeline, a Legal review panel, a Government Agent panel, document rejection-with-reason + customer re-upload, and certificate/receipt upload by the government agent.

## 1. Roles
Expand `User.role` enum to: `customer`, `sales`, `legal`, `compliance`, `government_agent`, `finance`, `support`, `admin` (admin = super admin, full access).
- Back-compat: existing `user` → treated as `customer`; existing `admin` stays super-admin. The enum keeps `user` and `admin` plus the new staff roles, so old data/tokens keep working.
- Middleware: `requireStaff` (any non-customer/user role) and `requireRole(...roles)` for specific gates. `requireAdmin` stays (admin only).

## 2. Granular status pipeline
Extend the status enum (keep existing values for back-compat) and add: `legal_review`, `waiting_government`, `completed`. Canonical labels:

| status | label | who advances |
|---|---|---|
| draft | Draft | customer |
| payment_pending | Waiting Payment | (system on checkout) |
| paid | Payment Received | (system on webhook) |
| documents_submitted | Documents Submitted | customer |
| in_review | Document Review | legal/admin |
| needs_more_docs | Pending Documents | legal/admin (bounce) |
| legal_review | Legal Review | legal/admin |
| waiting_government | Waiting Government | legal/compliance/admin |
| filing_submitted | Government Processing | government_agent/admin |
| registered | Approved | government_agent/admin |
| completed | Completed | government_agent/admin |
| rejected | Rejected | legal/admin |

The order's status state-machine is advisory (no hard transition guard beyond role permission), matching V2's flexible model.

## 3. Assignment
`Application` gains `assignedAgentId: ObjectId|null` (a government agent). Legal/admin assigns a case to an agent; the agent's panel shows only cases assigned to them (admin sees all).

## 4. Document rejection + re-upload
- `Document` gains `rejectionReason: string` (set when status → `rejected`).
- Legal/admin reject a document with a reason (`PATCH /api/admin/documents/:id { status:'rejected', reason }`).
- Customer detail page shows each document's status + rejection reason and a **re-upload** control (re-uploads via the existing per-order document upload; the new upload supersedes — old rejected doc stays for audit, newest pending shows).

## 5. Certificates / government uploads
Government agent uploads outcome documents using existing document upload with new types: extend `Document.type` enum to add `certificate`, `government_receipt`, `license`. These appear in the customer's detail under "Certificates / official documents" with a View link (existing guarded file route).

## 6. API
Staff endpoints (mounted under `/api/staff`, `requireStaff`):
- `GET /api/staff/applications?status=&assigned=me` — list (filter by status; agents see assigned).
- `GET /api/staff/applications/:id` + `/documents` — full review (reuse Phase-D admin fetch, generalized to staff).
- `PATCH /api/staff/applications/:id/status { status, note }` — role-checked transitions.
- `PATCH /api/staff/applications/:id/assign { agentId }` — legal/admin assigns government agent.
- `PATCH /api/staff/documents/:id { status, reason? }` — approve / reject (with reason) / request.
- `GET /api/staff/agents` — list government-agent users (for the assign dropdown; legal/admin only).
The existing `/api/admin/*` endpoints remain (admin superset) for back-compat; new work targets `/api/staff/*`.

Customer endpoint:
- Document re-upload uses the existing `POST /api/applications/:id/documents`.

## 7. Frontend
- **Role-aware staff area** at `/staff` (login via the existing `/admin/login`, which now accepts any staff role and routes by role):
  - **Legal panel** (legal/admin): applications needing review; open one → approve/reject documents **with reason**, request more docs, advance status (Document Review → Legal Review → Waiting Government), **assign a government agent** (dropdown from `/api/staff/agents`).
  - **Government Agent panel** (government_agent/admin): **assigned cases**; open one → upload **certificate / government receipt / license**, add remarks (note on status), advance Government Processing → Approved → Completed.
  - Admin sees both panels (super admin).
- `AdminLoginPage` → on login, route: `customer` → "not staff" message; staff → `/staff`.
- `StaffRoute` guard (non-customer roles); within `/staff`, render the panel(s) for the user's role.
- **Customer detail page**: show document rejection reasons + a **re-upload** button per rejected document; show certificates/official documents section with View links; richer status labels.
- `StatusBadge` + `STATUS_LABEL` updated for the new statuses.

## 8. Seed
Add staff users: `legal@chad.demo / Legal@123` (role legal), `agent@chad.demo / Agent@123` (role government_agent). Assign one in-review application to the agent; mark one document rejected with a reason; add a certificate document on the registered application.

## 9. Out of scope (later phases)
Certificate generation/templates (Phase 4 issues real PDF certs; here the agent just uploads files), notifications/emails (Phase 5), invoices (Phase 6), full per-role permission matrix UI, audit log (Phase 8). Phase 3 delivers the working internal + government workflow with role-gated panels and the reject→re-upload loop.

## 10. Testing
- Backend: role middleware (staff vs customer 403); staff list/assign/status; document reject with reason; agent sees only assigned; certificate document type accepted.
- Frontend: AdminLogin routes staff to /staff; Legal panel reject-with-reason + assign; Government Agent panel upload + advance; customer detail shows reject reason + re-upload.
