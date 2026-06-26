import { Router } from 'express'
import { User } from '../models/User.js'
import {
  hashPassword,
  verifyPassword,
  signToken,
  makeVerifyToken,
  hashToken,
} from '../lib/auth.js'
import { sendVerificationEmail, isEmailEnabled } from '../lib/email.js'
import { primaryClientUrl } from '../lib/clientUrls.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = Router()

// When the frontend and API are on DIFFERENT origins (e.g. Vercel + Render with
// VITE_API_URL), the auth cookie must be SameSite=None + Secure to be sent cross-site.
// Set COOKIE_SAMESITE=none on the backend in that case. Default 'lax' suits same-origin
// (local dev, or a Vercel /api proxy).
const COOKIE_SAMESITE = (process.env.COOKIE_SAMESITE as 'lax' | 'none' | 'strict' | undefined) ?? 'lax'
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: COOKIE_SAMESITE,
  secure: COOKIE_SAMESITE === 'none' || process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

authRouter.post('/signup', async (req, res) => {
  const { email, password, fullName, country, phone } = req.body ?? {}
  if (!email || !password || !fullName || !country) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  const existing = await User.findOne({ email: String(email).toLowerCase() })
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  // When email is OFF there is no way to deliver a verification link, so the
  // account is auto-verified and the user can log in straight away.
  if (!isEmailEnabled()) {
    await User.create({
      email,
      passwordHash: await hashPassword(password),
      fullName,
      country,
      phone: phone ?? '',
      emailVerified: true,
    })
    return res.status(201).json({ ok: true, verified: true, message: 'Account ready — you can log in now.' })
  }

  const { raw, hashed, expires } = makeVerifyToken()
  await User.create({
    email,
    passwordHash: await hashPassword(password),
    fullName,
    country,
    phone: phone ?? '',
    emailVerifyToken: hashed,
    emailVerifyExpires: expires,
  })
  const link = `${primaryClientUrl()}/verify-email?token=${raw}`
  await sendVerificationEmail(String(email), link)
  res.status(201).json({ ok: true, verified: false, message: 'Verification email sent' })
})

authRouter.get('/verify-email', async (req, res) => {
  const raw = String(req.query.token ?? '')
  if (!raw) return res.status(400).json({ error: 'Missing token' })
  const user = await User.findOne({
    emailVerifyToken: hashToken(raw),
    emailVerifyExpires: { $gt: new Date() },
  })
  if (!user) return res.status(400).json({ error: 'Invalid or expired token' })
  user.emailVerified = true
  user.emailVerifyToken = null
  user.emailVerifyExpires = null
  await user.save()
  res.json({ ok: true })
})

authRouter.post('/resend-verification', async (req, res) => {
  const email = String(req.body?.email ?? '').toLowerCase()
  const user = await User.findOne({ email })
  if (user && !user.emailVerified) {
    const { raw, hashed, expires } = makeVerifyToken()
    user.emailVerifyToken = hashed
    user.emailVerifyExpires = expires
    await user.save()
    const link = `${primaryClientUrl()}/verify-email?token=${raw}`
    await sendVerificationEmail(email, link)
  }
  res.json({ ok: true }) // always 200 — no enumeration
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  const user = await User.findOne({ email: String(email ?? '').toLowerCase() })
  if (!user || !(await verifyPassword(String(password ?? ''), user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  if (!user.emailVerified) {
    return res.status(403).json({ error: 'Please verify your email first' })
  }
  const token = signToken({ sub: String(user._id), role: user.role })
  res.cookie('token', token, COOKIE_OPTS)
  res.json({ id: user._id, email: user.email, fullName: user.fullName, role: user.role })
})

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('email fullName country role')
  if (!user) return res.status(404).json({ error: 'Not found' })
  res.json({
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    country: user.country,
    role: user.role,
  })
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: COOKIE_SAMESITE, secure: COOKIE_OPTS.secure })
  res.json({ ok: true })
})
