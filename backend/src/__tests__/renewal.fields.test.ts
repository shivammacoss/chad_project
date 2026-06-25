import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()
async function authed() {
  await User.create({ email: 'r@x.com', passwordHash: await hashPassword('secret123'), fullName: 'R', country: 'IN', emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'r@x.com', password: 'secret123' })
  return agent
}

describe('renewal fields + services', () => {
  it('exposes renewal services in the catalog', async () => {
    const res = await request(app).get('/api/services')
    const keys = res.body.map((s: { key: string }) => s.key)
    expect(keys).toContain('annual-renewal')
    expect(keys).toContain('license-renewal')
  })
  it('stores renewsApplicationId on a new order', async () => {
    const agent = await authed()
    const orig = await agent.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const renewal = await agent.post('/api/applications').send({ serviceKey: 'annual-renewal', renewsApplicationId: orig.body._id })
    expect(renewal.status).toBe(201)
    expect(String(renewal.body.renewsApplicationId)).toBe(String(orig.body._id))
  })
})
