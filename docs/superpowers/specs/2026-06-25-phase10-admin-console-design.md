# Phase 10 — Admin Console + Chad-Only Design

**Date:** 2026-06-25
**Status:** Design (Phase 10)
**Goal:** Make the platform Chad-only (remove the multi-country selector), and turn the admin area into a real console: overview stats, user management, and admin-configurable payment methods that flow to the customer checkout.

## 1. Chad-only
- Remove the example AE/KE services from the catalog; the seed catalog is Chad (`TD`) only.
- Remove the **country selector** from Get Started + Start Service (the flow is implicitly Chad). The backend country registry stays (harmless) but only `TD` is seeded, and the UI no longer shows a chooser.

## 2. Admin overview stats
- `GET /api/admin/stats` (requireAdmin) → `{ applications: { total, byStatus: {…} }, revenueCents (sum of paid invoices), users (count), openTickets }`.
- A **Stats** header at the top of the admin console.

## 3. User management
- `GET /api/admin/users` (requireAdmin) → list `{ _id, email, fullName, role, country, emailVerified, createdAt }`.
- `PATCH /api/admin/users/:id/role` { role } (requireAdmin) → change a user's role (validated enum); `logAudit`. (An admin may not demote their own account, to avoid lockout.)
- A **Users** panel: table + a role dropdown per user.

## 4. Admin-configurable payment methods
- `Settings` collection (singleton, key `payment`): `{ stripe: bool, bank_transfer: bool, flutterwave: bool }`. Default `{ stripe: true, bank_transfer: true, flutterwave: false }`.
- `GET /api/settings/payment` (public) → the enabled methods, for the checkout UI.
- `PATCH /api/admin/settings/payment` (requireAdmin) → toggle methods; `logAudit`.
- **Checkout UI** (both wizards) reads `GET /api/settings/payment` and shows only enabled methods; the backend checkout rejects a disabled method (400).
- A **Payment settings** panel in the admin console with toggles.

## 5. Admin console feel
- The `/staff` page, for the `admin` role, renders an organized **Admin Console**: a stats header, then sections — Applications review, Users, Service catalog, Payment settings, Support tickets, Audit log. Section headings + spacing so it reads like an admin console (not a flat list). Non-admin staff keep their role-scoped panels.

## 6. Out of scope
Real Flutterwave integration (still a toggle + "coming soon" at checkout), per-user activation/ban, granular permission matrix, multi-currency, settings beyond payment methods.

## 7. Testing
- Backend: stats returns counts + revenue; users list + role change (with self-demote guard); settings get/patch; checkout rejects a disabled method; AE/KE services no longer seeded.
- Frontend: admin sees Stats + Users + Payment settings panels; checkout shows only enabled methods; no country selector on Get Started.
