import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'
import { __setStripe } from '../lib/stripe.js'

const app = createApp()

beforeEach(() => {
  __setStripe({
    checkout: {
      sessions: {
        create: vi.fn(async () => ({ id: 'cs', url: 'https://s.test' })),
      },
    },
    webhooks: {
      constructEvent: () => ({ type: 'x', data: { object: {} } }) as never,
    },
  })
})

async function login(role: string, email: string) {
  await User.create({
    email,
    passwordHash: await hashPassword('secret123'),
    fullName: role,
    country: 'IN',
    role,
    emailVerified: true,
  })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('payment settings', () => {
  it('public default has stripe+bank on, flutterwave off', async () => {
    const res = await request(app).get('/api/settings/payment')
    expect(res.body.stripe).toBe(true)
    expect(res.body.bank_transfer).toBe(true)
    expect(res.body.flutterwave).toBe(false)
  })

  it('admin disables bank transfer; checkout then rejects it', async () => {
    const admin = await login('admin', 'a@x.com')
    await admin.patch('/api/admin/settings/payment').send({ bank_transfer: false })
    const customer = await login('customer', 'c@x.com')
    const order = await customer
      .post('/api/applications')
      .send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const res = await customer
      .post(`/api/applications/${order.body._id}/checkout`)
      .send({ method: 'bank_transfer' })
    expect(res.status).toBe(400)
  })

  it('catalog is Chad-only (no AE/KE services)', async () => {
    const res = await request(app).get('/api/services?country=all')
    const keys = res.body.map((s: { key: string }) => s.key)
    expect(keys).not.toContain('uae-company-formation')
    expect(keys).not.toContain('kenya-company-formation')
  })
})
