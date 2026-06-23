import { Router } from 'express'
import { User } from '../models/User.js'
import {
  hashPassword,
  verifyPassword,
  signToken,
  makeVerifyToken,
  hashToken,
} from '../lib/auth.js'
import { sendVerificationEmail } from '../lib/email.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = Router()

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

authRouter.post('/signup', async (req, res) => {
  const { email, password, fullName, country } = req.body ?? {}
  if (!email || !password || !fullName || !country) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  const existing = await User.findOne({ email: String(email).toLowerCase() })
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const { raw, hashed, expires } = makeVerifyToken()
  await User.create({
    email,
    passwordHash: await hashPassword(password),
    fullName,
    country,
    emailVerifyToken: hashed,
    emailVerifyExpires: expires,
  })
  const link = `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/verify-email?token=${raw}`
  await sendVerificationEmail(String(email), link)
  res.status(201).json({ ok: true, message: 'Verification email sent' })
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
    const link = `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/verify-email?token=${raw}`
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
  res.clearCookie('token')
  res.json({ ok: true })
})
