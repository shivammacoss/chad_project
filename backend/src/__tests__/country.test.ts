import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()
async function authed(email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: 'U', country: 'IN', emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('multi-country', () => {
  it('lists countries', async () => {
    const res = await request(app).get('/api/countries')
    const codes = res.body.map((c: { code: string }) => c.code)
    expect(codes).toContain('TD'); expect(codes).toContain('AE'); expect(codes).toContain('KE')
  })
  it('chad-only catalog excludes ae/ke services', async () => {
    const all = await request(app).get('/api/services?country=all')
    const keys = all.body.map((s: { key: string }) => s.key)
    expect(keys).not.toContain('uae-company-formation')
    expect(keys).not.toContain('kenya-company-formation')
    const td = await request(app).get('/api/services?country=TD')
    expect(td.body.find((s: { key: string }) => s.key === 'company-formation')).toBeTruthy()
  })
  it('sets application.country to default from service', async () => {
    const agent = await authed('c@x.com')
    const order = await agent.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    expect(order.body.country).toBe('TD')
  })
})
