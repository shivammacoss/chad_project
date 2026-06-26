# Deploy — Frontend on Vercel, Backend on Render or Railway

The frontend reads `VITE_API_URL` (its `.env`) to know the backend's address and calls it
directly. Because the two are on different origins, the auth cookie is sent **cross-site**, so
the backend uses `SameSite=None; Secure` cookies and CORS allows the Vercel origin.

```
Browser ──> Vercel (frontend, static)
   │
   └──(VITE_API_URL)──> Render/Railway (Express API) ──> MongoDB Atlas
                                  └── Stripe webhook hits the backend directly
```

## 0. Prerequisites — MongoDB Atlas (free)
Railway/Render disks are ephemeral, so the DB must be external.
1. Create a free Atlas cluster → Connect → Drivers → copy the URI.
2. Add the database name: `mongodb+srv://USER:PASS@host/chad?retryWrites=true&w=majority`.
3. Atlas → Network Access → allow `0.0.0.0/0`.

---

## 1. Backend → Render (recommended free) or Railway

### Render (free)
1. render.com → **New → Web Service** → connect the GitHub repo.
2. Settings: **Root Directory** `backend` · **Build** `npm install` · **Start** `npm run start` · Instance **Free**.
3. **Environment** variables:
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | your Atlas URI (with `/chad`) |
   | `JWT_SECRET` | any long random string |
   | `CLIENT_URL` | your Vercel URL — **no trailing slash**, e.g. `https://chad-project.vercel.app`. Can be a comma list for multiple domains. |
   | `COOKIE_SAMESITE` | `none`  ← **required** so login works cross-site |
   | `ALLOW_VERCEL_PREVIEWS` | `true` (optional) — also allow Vercel preview URLs (`*.vercel.app`) so per-deploy URLs work |
   | `NODE_ENV` | `production` |
   | `EMAIL_ENABLED` | `false` |
   | `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | optional (card payments) |
4. Deploy → copy the URL, e.g. `https://chad-backend.onrender.com`.
   (Free Render sleeps after ~15 min idle → first request after is slow ~50s.)
5. Seed demo data once: Render → service → **Shell** → `npm run seed`.

### Railway (alternative)
Same idea: New Project → repo → **Root Directory** `backend`, Start `npm run start`, add the
exact same variables (including `COOKIE_SAMESITE=none`). Copy the `*.up.railway.app` URL.

> Other free options: **Koyeb** (no idle-sleep), **Fly.io** (needs a Dockerfile).

---

## 2. Frontend → Vercel

1. vercel.com → **Add New → Project** → import the repo.
2. **Root Directory:** `frontend` · Framework **Vite** (auto) · Build `npm run build` · Output `dist`.
3. **Environment Variables** → add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | your backend URL from step 1, e.g. `https://chad-backend.onrender.com` (no trailing slash, no `/api`) |
4. Deploy → site is at `https://<project>.vercel.app`.
5. Back on the backend, set `CLIENT_URL` to this exact Vercel URL and redeploy
   (used by CORS, invoice/cert links, and Stripe redirect URLs).

That's it — open the Vercel URL and log in.

---

## 3. Stripe webhook (only for real card payments)
Stripe Dashboard → Developers → Webhooks → Add endpoint:
`https://YOUR-BACKEND/api/webhooks/stripe`, event `checkout.session.completed`.
Put its signing secret in `STRIPE_WEBHOOK_SECRET` and redeploy the backend.

## 4. Notes / free-tier limits
- **Login fails / "blocked by CORS policy"?** The browser Origin must match `CLIENT_URL`
  exactly (trailing slashes are now ignored by the backend). Make sure you open the **same**
  Vercel URL you put in `CLIENT_URL`. If you use Vercel **preview** URLs (`...-projects.vercel.app`,
  which change per deploy), set `ALLOW_VERCEL_PREVIEWS=true`, or just always use your stable
  production URL.
- **Login not sticking (no error)?** Usually `COOKIE_SAMESITE=none` not set, or `VITE_API_URL`
  wrong/missing on Vercel.
- **Uploaded KYC files** live on the host's local disk → wiped on redeploy. Certificates and
  invoices regenerate on demand (from data), so those survive. Move uploads to S3/R2 for
  persistence (launch hardening).
- **Email is OFF** (`EMAIL_ENABLED=false`) → new signups auto-verify, login works without SMTP.
- Use **Stripe test keys** only.

## 5. Local dev
Leave `VITE_API_URL` empty locally — `vite.config.ts` proxies `/api` to `localhost:4000`.
`cd backend && npm run seed && npm run dev` + `cd frontend && npm run dev`.

## 6. Redeploys
Push to `main` → Vercel and the backend host both auto-deploy their folders.
