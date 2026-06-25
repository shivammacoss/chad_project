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
    checkout: { sessions: { create: vi.fn(async () => ({ id: 'cs_1', url: 'https://stripe.test/pay' })) } },
    webhooks: { constructEvent: () => ({ type: 'x', data: { object: {} } }) as never },
  })
})

async function authed(email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: 'U', country: 'IN', emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('delete draft application', () => {
  it('deletes a draft owned by the user', async () => {
    const agent = await authed('c@x.com')
    const created = await agent.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const res = await agent.delete(`/api/applications/${created.body._id}`)
    expect(res.status).toBe(200)
    expect(await Application.findById(created.body._id)).toBeNull()
  })

  it('refuses to delete a non-draft application', async () => {
    const agent = await authed('c2@x.com')
    const created = await agent.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    await agent.post(`/api/applications/${created.body._id}/checkout`).send({ method: 'stripe' }) // moves to payment_pending
    const res = await agent.delete(`/api/applications/${created.body._id}`)
    expect(res.status).toBe(400)
    expect(await Application.findById(created.body._id)).not.toBeNull()
  })

  it('cannot delete another user draft', async () => {
    const a = await authed('a@x.com')
    const created = await a.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const b = await authed('b@x.com')
    const res = await b.delete(`/api/applications/${created.body._id}`)
    expect(res.status).toBe(404)
  })
})
