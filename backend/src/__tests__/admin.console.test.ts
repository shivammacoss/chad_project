import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'
import { __setTransport } from '../lib/email.js'

const app = createApp()
beforeEach(() => { __setTransport({ sendMail: vi.fn(async () => ({})) }) })
async function login(role: string, email: string) {
  const u = await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return { agent, id: String(u._id) }
}

describe('admin console', () => {
  it('returns stats', async () => {
    const customer = await login('customer', 'c@x.com')
    await customer.agent.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const admin = await login('admin', 'a@x.com')
    const res = await admin.agent.get('/api/admin/stats')
    expect(res.status).toBe(200)
    expect(res.body.applications.total).toBeGreaterThanOrEqual(1)
    expect(typeof res.body.users).toBe('number')
  })
  it('lists users and changes a role; cannot change own', async () => {
    const target = await login('customer', 't@x.com')
    const admin = await login('admin', 'a2@x.com')
    const list = await admin.agent.get('/api/admin/users')
    expect(list.body.length).toBeGreaterThanOrEqual(2)
    const changed = await admin.agent.patch(`/api/admin/users/${target.id}/role`).send({ role: 'legal' })
    expect(changed.body.role).toBe('legal')
    const self = await admin.agent.patch(`/api/admin/users/${admin.id}/role`).send({ role: 'customer' })
    expect(self.status).toBe(400)
  })
  it('blocks non-admins', async () => {
    const legal = await login('legal', 'l@x.com')
    expect((await legal.agent.get('/api/admin/stats')).status).toBe(403)
  })
})
