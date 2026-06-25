# Phase 8 — Support Tickets & Audit Log Design

**Date:** 2026-06-25
**Status:** Design (Phase 8 of the full-platform roadmap)
**Goal:** A customer support ticket system (customer opens, staff replies, threaded) and an audit log of key staff/admin actions (who, when, IP, action, target). CRM timeline is kept lightweight (the customer's tickets serve as the interaction history); full call/WhatsApp CRM is deferred.

## 1. Scope
Support tickets (customer ↔ staff threaded, categories, open/closed) + an audit log written at key mutations and viewable by admin. Out: full CRM (calls/WhatsApp/notes timeline), SLAs, ticket assignment routing.

## 2. Support tickets — data model
`Ticket` collection:
| field | type | notes |
|---|---|---|
| _id | ObjectId | |
| userId | ObjectId | ref User (the customer), indexed |
| category | enum | `legal` \| `payment` \| `documents` \| `technical` \| `other` |
| subject | string | |
| status | enum | `open` \| `closed` (default open) |
| messages | array | `[{ authorId, authorRole, body, at }]` (threaded) |
| createdAt | Date | |
| updatedAt | Date | bumped on each message / status change |

## 3. Support tickets — API
Customer (`requireAuth`, scoped to `req.userId`):
- `POST /api/tickets` { category, subject, body } → creates a ticket with the first message.
- `GET /api/tickets` → my tickets (newest updated first).
- `GET /api/tickets/:id` → one of mine (with messages).
- `POST /api/tickets/:id/messages` { body } → append my message; reopen if closed; notify staff is optional.

Staff (`requireAuth + requireStaff`):
- `GET /api/staff/tickets?status=` → all tickets (filter), newest updated first, user email populated.
- `GET /api/staff/tickets/:id` → any ticket.
- `POST /api/staff/tickets/:id/messages` { body } → append a staff message; `notifyUser(ticket.userId, …)` "Support replied".
- `PATCH /api/staff/tickets/:id` { status } → close/reopen.

## 4. Audit log — data model
`AuditLog` collection (append-only):
| field | type | notes |
|---|---|---|
| _id | ObjectId | |
| actorId | ObjectId | who did it (nullable for system) |
| actorRole | string | role at the time |
| action | string | e.g. `application.status`, `document.review`, `payment.confirm`, `certificate.issue`, `ticket.reply` |
| target | string | e.g. `application:<id>` |
| meta | object | small detail, e.g. `{ from, to }` or `{ status, reason }` |
| ip | string | request IP |
| at | Date | |

## 5. Audit log — wiring
`backend/src/lib/audit.ts` → `logAudit(req, action, target, meta?)` reads `req.userId`, `req.userRole`, `req.ip` and inserts an `AuditLog` (best-effort, never throws). Wire `logAudit` into the key staff/admin mutations:
- staff/admin status change → `application.status` `{ to }`
- document approve/reject → `document.review` `{ status, reason }`
- bank payment confirm → `payment.confirm`
- certificate issue → `certificate.issue` `{ regNo }`
- assign agent → `application.assign` `{ agentId }`
- staff ticket reply / close → `ticket.reply` / `ticket.status`

Admin view:
- `GET /api/admin/audit?limit=` (`requireAdmin`) → recent entries (cap 100), actor email populated.

## 6. Frontend
- **Customer Support page** (`/support`, ProtectedRoute): list my tickets (subject, category, status), open one → message thread + reply box; a "New ticket" form (category + subject + message). A nav/dashboard link "Support".
- **Staff Tickets panel** (in `/staff`, for `support`/`admin` and also visible to `legal`/`compliance`): list all tickets, open one → thread + staff reply + close/reopen.
- **Admin Audit log** (in `/staff` for `admin`, or a `/staff` sub-section): a table of recent audit entries (time, actor, action, target, meta).
- **Types**: `Ticket`, `TicketMessage`, `AuditEntry`.

## 7. Seed
- Seed 1 open ticket for the demo user (category `documents`, one message) so the staff Tickets panel shows activity.
- Audit log starts empty (populated as actions occur); optionally seed 1–2 entries.

## 8. Out of scope (later)
Full CRM (calls/WhatsApp/notes), ticket assignment/SLA, audit log filtering/search UI, file attachments on tickets, email-to-ticket. Admin-config (Phase 7b) remains separate.

## 9. Testing
- Backend: customer creates a ticket + replies; staff lists/answers/closes; reply notifies the other party; ticket scoping (a customer cannot read another's ticket). `logAudit` writes an entry and never throws; a staff status change creates an `application.status` audit entry; `GET /api/admin/audit` is admin-gated.
- Frontend: support page creates a ticket and shows the thread; staff tickets panel lists + replies; admin audit view renders entries.
