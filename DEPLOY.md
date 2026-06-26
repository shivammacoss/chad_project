# Deploy — Frontend on Vercel, Backend on Railway

The browser only ever talks to your Vercel domain. Vercel **proxies `/api/*` to Railway**
(see `frontend/vercel.json`), so everything is same-origin: login cookies and file
downloads work with **no CORS or cross-domain cookie problems**.

```
Browser ──> Vercel (frontend + /api proxy) ──> Railway (Express API) ──> MongoDB Atlas
                                                         └── Stripe webhook hits Railway directly
```

## 0. Prerequisites
- A **MongoDB Atlas** free cluster (Railway's disk is ephemeral, so the DB must be external).
  Create one → "Connect" → "Drivers" → copy the connection string (looks like
  `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/chad?retryWrites=true&w=majority`).
  In Atlas → Network Access → allow `0.0.0.0/0` (or Railway's egress IPs).

---

## 1. Backend → Railway

1. railway.app → **New Project → Deploy from GitHub repo** → pick `shivammacoss/chad_project`.
2. In the service **Settings**:
   - **Root Directory:** `backend`
   - **Start Command:** `npm run start` (already `tsx src/index.ts`)
   - (Build command can stay default / empty — `tsx` runs TypeScript directly.)
3. **Variables** (Settings → Variables) — add:
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | your Atlas connection string |
   | `JWT_SECRET` | any long random string |
   | `CLIENT_URL` | your Vercel URL, e.g. `https://chad-project.vercel.app` |
   | `NODE_ENV` | `production` |
   | `EMAIL_ENABLED` | `false` (keep email off for now) |
   | `STRIPE_SECRET_KEY` | your Stripe **test** secret (optional — only for card checkout) |
   | `STRIPE_WEBHOOK_SECRET` | from the Stripe webhook you create in step 4 (optional) |
   - Railway provides `PORT` automatically; the server reads it.
4. Deploy. Copy the public URL Railway gives you, e.g. `https://chad-project-production.up.railway.app`.
5. **Seed demo data once** (optional, for the demo logins): Railway → your service →
   **⋯ → Run a command** (or the "Shell"): `npm run seed`.
   This creates `admin@chad.demo / Admin@123`, `user@chad.demo / User@123`, `legal@…`, `agent@…`.
6. (Optional, for real card payments) Stripe Dashboard → Developers → Webhooks → **Add endpoint**:
   `https://YOUR-BACKEND.up.railway.app/api/webhooks/stripe`, event `checkout.session.completed`.
   Copy its signing secret into the `STRIPE_WEBHOOK_SECRET` variable and redeploy.

---

## 2. Frontend → Vercel

1. **Edit `frontend/vercel.json`** — replace `YOUR-BACKEND.up.railway.app` with the Railway
   URL from step 1.4 (keep the `/api/:path*` suffix). Commit + push.
2. vercel.com → **Add New → Project** → import `shivammacoss/chad_project`.
3. In the import screen:
   - **Root Directory:** `frontend`
   - Framework Preset: **Vite** (auto-detected). Build: `npm run build`, Output: `dist`.
4. Deploy. Your site is at `https://<project>.vercel.app`.
5. Go back to Railway and make sure `CLIENT_URL` matches this exact Vercel URL, then redeploy
   the backend (used for invoice/cert links and Stripe redirect URLs).

That's it — open the Vercel URL, log in via `/admin/login` (admin) or **Get Started** (customer).

---

## 3. Notes / limitations on the free tier
- **Uploaded KYC files** are written to Railway's local disk, which is **wiped on every
  redeploy**. Generated **certificates and invoices regenerate on demand** (from data), so
  those survive redeploys; only raw user uploads are ephemeral. Move uploads to S3/R2 for
  persistence (tracked as launch hardening).
- **Email is OFF** (`EMAIL_ENABLED=false`) — new signups auto-verify, so login works without
  SMTP. Set `EMAIL_ENABLED=true` + SMTP vars to enable real emails.
- Use **Stripe test keys** only. Card payments need the webhook (step 1.6); bank-transfer +
  the rest work without Stripe.
- If login seems to "not stick": confirm `frontend/vercel.json` points at the right Railway
  URL and `NODE_ENV=production` is set on Railway (so cookies are `Secure`).

## 4. Redeploys
Push to `main` → Vercel and Railway both auto-deploy their respective folders.
