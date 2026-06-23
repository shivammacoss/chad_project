import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()

async function authedAgent() {
  await User.create({
    email: 'u@x.com',
    passwordHash: await hashPassword('secret123'),
    fullName: 'U',
    country: 'IN',
    emailVerified: true,
  })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'u@x.com', password: 'secret123' })
  return agent
}

describe('formations routes', () => {
  it('requires auth', async () => {
    const res = await request(app).get('/api/formations')
    expect(res.status).toBe(401)
  })

  it('creates a formation in draft with correct price', async () => {
    const agent = await authedAgent()
    const res = await agent
      .post('/api/formations')
      .send({ entityType: 'SARL', companyName: 'Acme SARL', packageTier: 'standard' })
    expect(res.status).toBe(201)
    expect(res.body.status).toBe('draft')
    expect(res.body.priceCents).toBe(49900)
    expect(res.body.statusHistory).toHaveLength(1)
  })

  it('submits a draft to documents_submitted', async () => {
    const agent = await authedAgent()
    const created = await agent
      .post('/api/formations')
      .send({ entityType: 'SA', companyName: 'Big SA' })
    const res = await agent.post(`/api/formations/${created.body._id}/submit`)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('documents_submitted')
  })

  it('rejects invalid entityType', async () => {
    const agent = await authedAgent()
    const res = await agent
      .post('/api/formations')
      .send({ entityType: 'LLC', companyName: 'x' })
    expect(res.status).toBe(400)
  })
})
