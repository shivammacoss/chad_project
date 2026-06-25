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
  it('filters services by country', async () => {
    const ae = await request(app).get('/api/services?country=AE')
    expect(ae.body.every((s: { country: string }) => s.country === 'AE')).toBe(true)
    expect(ae.body.find((s: { key: string }) => s.key === 'uae-company-formation')).toBeTruthy()
    const td = await request(app).get('/api/services?country=TD')
    expect(td.body.find((s: { key: string }) => s.key === 'company-formation')).toBeTruthy()
  })
  it('sets application.country from the service', async () => {
    const agent = await authed('c@x.com')
    const order = await agent.post('/api/applications').send({ serviceKey: 'uae-company-formation' })
    expect(order.body.country).toBe('AE')
  })
})
