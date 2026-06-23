import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()

async function loginAs(role: string, email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('staff routes', () => {
  it('blocks customers from staff endpoints', async () => {
    const cust = await loginAs('customer', 'c@x.com')
    expect((await cust.get('/api/staff/applications')).status).toBe(403)
  })

  it('legal can list, assign an agent, and reject a doc with a reason', async () => {
    const customer = await loginAs('customer', 'cust@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const id = created.body._id
    const up = await customer.post(`/api/applications/${id}/documents`)
      .field('type', 'passport').field('ownerName', 'A')
      .attach('file', Buffer.from('x'), { filename: 'p.pdf', contentType: 'application/pdf' })

    const agentUser = await User.create({ email: 'ag@x.com', passwordHash: await hashPassword('secret123'), fullName: 'Agent', country: 'IN', role: 'government_agent', emailVerified: true })
    const legal = await loginAs('legal', 'legal@x.com')

    const list = await legal.get('/api/staff/applications')
    expect(list.status).toBe(200)
    expect(list.body.length).toBeGreaterThanOrEqual(1)

    const assigned = await legal.patch(`/api/staff/applications/${id}/assign`).send({ agentId: String(agentUser._id) })
    expect(assigned.status).toBe(200)
    expect(String(assigned.body.assignedAgentId._id ?? assigned.body.assignedAgentId)).toBe(String(agentUser._id))

    const rej = await legal.patch(`/api/staff/documents/${up.body._id}`).send({ status: 'rejected', reason: 'Blurry passport' })
    expect(rej.status).toBe(200)
    expect(rej.body.rejectionReason).toBe('Blurry passport')
  })

  it('agent sees only assigned cases', async () => {
    const customer = await loginAs('customer', 'c2@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'virtual-office' })
    const agentUser = await User.create({ email: 'ag2@x.com', passwordHash: await hashPassword('secret123'), fullName: 'Agent2', country: 'IN', role: 'government_agent', emailVerified: true })
    const legal = await loginAs('legal', 'legal2@x.com')
    await legal.patch(`/api/staff/applications/${created.body._id}/assign`).send({ agentId: String(agentUser._id) })
    const agent = request.agent(app)
    await agent.post('/api/auth/login').send({ email: 'ag2@x.com', password: 'secret123' })
    const mine = await agent.get('/api/staff/applications?assigned=me')
    expect(mine.status).toBe(200)
    expect(mine.body.length).toBe(1)
  })
})
