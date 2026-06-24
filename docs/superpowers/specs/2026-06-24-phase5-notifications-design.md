# Phase 5 — Notifications & Email Automation Design

**Date:** 2026-06-24
**Status:** Design (Phase 5 of the full-platform roadmap)
**Goal:** Keep customers informed at every workflow step via **in-app notifications (bell)** and **email**, driven by a single `notifyUser` helper fired at key events (submitted, paid, document rejected, approved/certificate issued).

## 1. Scope
In-app notification center (bell + unread count + list + mark-read) and best-effort transactional emails at the same events. A durable queue (Redis/BullMQ) is **deferred** — sends are fire-and-forget with errors swallowed so an unconfigured SMTP never breaks the workflow.

## 2. Data model
New `Notification` collection:
| field | type | notes |
|---|---|---|
| _id | ObjectId | |
| userId | ObjectId | ref User, indexed |
| type | string | `payment` \| `document` \| `status` \| `certificate` \| `info` |
| title | string | short headline |
| body | string | one-line detail |
| link | string | in-app path (e.g. `/applications/<id>`) |
| read | boolean | default false |
| createdAt | Date | |

## 3. Notify helper
`backend/src/lib/notify.ts` → `notifyUser(userId, { type, title, body, link })`:
1. Creates a `Notification` document.
2. Looks up the user's email and **best-effort** sends a templated email (`sendNotificationEmail(to, title, body)` via the existing Nodemailer transport) — wrapped in try/catch so failures are logged and ignored.
This is the one place both channels fire, so events only call `notifyUser`.

## 4. Events that notify the customer
- **Application submitted** (status → `documents_submitted`): "Application received — we'll review your documents."
- **Payment received** (Stripe webhook marks `paid`): "Payment received — your application is now in processing."
- **Document rejected** (staff rejects a document with a reason): "A document needs attention — {reason}." (link to the application).
- **Company approved / certificate issued** (`issue-certificate`, or status → `registered`): "Your company is registered! Certificate {regNo} is ready to download."
Each fires `notifyUser(app.userId, …)` with a link to `/applications/:id`.

## 5. API (customer)
Under `requireAuth`, scoped to `req.userId`:
- `GET /api/notifications` — my notifications, newest first (cap 50).
- `GET /api/notifications/unread-count` — `{ count }`.
- `PATCH /api/notifications/:id/read` — mark one read.
- `PATCH /api/notifications/read-all` — mark all read.

## 6. Frontend
- **`NotificationBell`** component in the navbar (shown when logged in): a bell icon with an unread badge; on click, a dropdown lists recent notifications (title + body + relative time), each clickable → mark read + navigate to its `link`; a "Mark all read" action. Polls `unread-count` on mount and after opening (no websockets — simple fetch; refresh on open is enough for the demo).
- **Types**: a `Notification` type in `types/app.ts`.
- Wire `<NotificationBell />` into the authenticated cluster of `Navbar.tsx` (next to Dashboard/Log out), for both desktop and mobile.

## 7. Email
- Extend `backend/src/lib/email.ts` with `sendNotificationEmail(to, title, body)` reusing the existing transport (`__setTransport` test seam still applies). Keep `sendVerificationEmail`.
- Emails are plain templated HTML (title as heading, body, a footer line). No new provider.

## 8. Seed
Seed 2–3 notifications for the demo user (e.g., one unread "Payment received", one "Certificate ready") so the bell shows activity immediately.

## 9. Out of scope (later)
Redis/BullMQ queue, SMS, per-user notification preferences, websocket/live push, staff-side notifications (assignment alerts) — this phase notifies the **customer** at the four core events. Renewal-due notifications come with Phase 7 (renewals).

## 10. Testing
- Backend: `notifyUser` creates a Notification and does not throw when email fails (inject a throwing transport); notification routes (list, unread-count, mark read, mark-all) scoped to the user; webhook `paid` and document-reject create notifications.
- Frontend: NotificationBell shows the unread count and renders items; clicking an item marks it read.
