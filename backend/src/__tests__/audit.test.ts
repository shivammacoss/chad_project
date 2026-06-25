import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { Application } from '../models/Application.js'
import { hashPassword } from '../lib/auth.js'
import { __setTransport } from '../lib/email.js'
import { AuditLog } from '../models/AuditLog.js'

const app = createApp()
beforeEach(() => { __setTransport({ sendMail: vi.fn(async () => ({})) }) })
async function login(role: string, email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('audit log', () => {
  it('records a staff status change and admin can read the audit', async () => {
    const customer = await login('customer', 'c@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const legal = await login('legal', 'l@x.com')
    await legal.patch(`/api/staff/applications/${created.body._id}/status`).send({ status: 'in_review' })
    expect(await AuditLog.countDocuments({ action: 'application.status' })).toBeGreaterThanOrEqual(1)

    const admin = await login('admin', 'a@x.com')
    const audit = await admin.get('/api/admin/audit')
    expect(audit.status).toBe(200)
    expect(audit.body.length).toBeGreaterThanOrEqual(1)
    // non-admin blocked
    expect((await legal.get('/api/admin/audit')).status).toBe(403)
  })
})
