import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { Application } from '../models/Application.js'
import { hashPassword } from '../lib/auth.js'
import { __setStripe } from '../lib/stripe.js'

const app = createApp()

beforeEach(() => {
  __setStripe({
    checkout: { sessions: { create: vi.fn(async () => ({ id: 'cs_test_123', url: 'https://stripe.test/pay' })) } },
    webhooks: { constructEvent: () => ({ type: 'checkout.session.completed', data: { object: { id: 'cs_test_123' } } }) as never },
  })
})

async function setup() {
  await User.create({ email: 'p@x.com', passwordHash: await hashPassword('secret123'), fullName: 'P', country: 'IN', emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'p@x.com', password: 'secret123' })
  const a = await agent.post('/api/applications').send({ entityType: 'SARL', packageTier: 'standard' })
  return { agent, id: a.body._id as string }
}

describe('payments', () => {
  it('creates a checkout session and sets payment_pending', async () => {
    const { agent, id } = await setup()
    const res = await agent.post(`/api/applications/${id}/checkout`)
    expect(res.status).toBe(200)
    expect(res.body.url).toBe('https://stripe.test/pay')
    const a = await Application.findById(id)
    expect(a!.status).toBe('payment_pending')
    expect(a!.stripeSessionId).toBe('cs_test_123')
  })

  it('marks paid on webhook completion', async () => {
    const { agent, id } = await setup()
    await agent.post(`/api/applications/${id}/checkout`)
    await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'sig')
      .set('Content-Type', 'application/json')
      .send(Buffer.from('{}'))
    const a = await Application.findById(id)
    expect(a!.paymentStatus).toBe('paid')
    expect(a!.status).toBe('paid')
  })
})
