import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { __setTransport } from '../lib/email.js'
import { User } from '../models/User.js'

const app = createApp()
let lastLink = ''

beforeEach(() => {
  __setTransport({
    sendMail: vi.fn(async (opts: { html: string }) => {
      lastLink = opts.html.match(/token=([a-f0-9]+)/)?.[1] ?? ''
    }),
  })
})

async function signup() {
  return request(app).post('/api/auth/signup').send({
    email: 'jo@x.com',
    password: 'secret123',
    fullName: 'Jo',
    country: 'India',
  })
}

describe('auth routes', () => {
  it('signs up and sends a verification link', async () => {
    const res = await signup()
    expect(res.status).toBe(201)
    expect(lastLink).toMatch(/^[a-f0-9]+$/)
  })

  it('blocks login until verified, then allows it', async () => {
    await signup()
    const blocked = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jo@x.com', password: 'secret123' })
    expect(blocked.status).toBe(403)

    const verify = await request(app).get(`/api/auth/verify-email?token=${lastLink}`)
    expect(verify.status).toBe(200)

    const ok = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jo@x.com', password: 'secret123' })
    expect(ok.status).toBe(200)
    expect(ok.headers['set-cookie'][0]).toContain('token=')
  })

  it('rejects an invalid verify token', async () => {
    const res = await request(app).get('/api/auth/verify-email?token=deadbeef')
    expect(res.status).toBe(400)
  })

  it('me returns the current user after login', async () => {
    await signup()
    const u = await User.findOne({ email: 'jo@x.com' })
    u!.emailVerified = true
    u!.emailVerifyToken = null
    await u!.save()
    const agent = request.agent(app)
    await agent.post('/api/auth/login').send({ email: 'jo@x.com', password: 'secret123' })
    const me = await agent.get('/api/auth/me')
    expect(me.status).toBe(200)
    expect(me.body.email).toBe('jo@x.com')
  })
})
