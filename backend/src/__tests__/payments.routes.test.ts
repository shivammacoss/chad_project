import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { Formation } from '../models/Formation.js'
import { hashPassword } from '../lib/auth.js'
import { __setStripe } from '../lib/stripe.js'

const app = createApp()

beforeEach(() => {
  __setStripe({
    checkout: {
      sessions: {
        create: vi.fn(async () => ({ id: 'cs_test_123', url: 'https://stripe.test/pay' })),
      },
    },
    webhooks: {
      constructEvent: () =>
        ({
          type: 'checkout.session.completed',
          data: { object: { id: 'cs_test_123' } },
        }) as never,
    },
  })
})

async function setup() {
  await User.create({
    email: 'p@x.com',
    passwordHash: await hashPassword('secret123'),
    fullName: 'P',
    country: 'IN',
    emailVerified: true,
  })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'p@x.com', password: 'secret123' })
  const f = await agent.post('/api/formations').send({ entityType: 'SARL', companyName: 'Acme' })
  return { agent, id: f.body._id as string }
}

describe('payments', () => {
  it('creates a checkout session and sets payment_pending', async () => {
    const { agent, id } = await setup()
    const res = await agent.post(`/api/formations/${id}/checkout`)
    expect(res.status).toBe(200)
    expect(res.body.url).toBe('https://stripe.test/pay')
    const f = await Formation.findById(id)
    expect(f!.status).toBe('payment_pending')
    expect(f!.stripeSessionId).toBe('cs_test_123')
  })

  it('marks paid on webhook completion', async () => {
    const { agent, id } = await setup()
    await agent.post(`/api/formations/${id}/checkout`) // sets stripeSessionId
    await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'sig')
      .set('Content-Type', 'application/json')
      .send(Buffer.from('{}'))
    const f = await Formation.findById(id)
    expect(f!.paymentStatus).toBe('paid')
    expect(f!.status).toBe('paid')
  })
})
