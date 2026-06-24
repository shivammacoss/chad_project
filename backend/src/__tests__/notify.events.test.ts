import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'
import { __setTransport } from '../lib/email.js'
import { Notification } from '../models/Notification.js'

const app = createApp()
beforeEach(() => { __setTransport({ sendMail: vi.fn(async () => ({})) }) })

async function login(role: string, email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('notify on events', () => {
  it('notifies the customer when a staff member rejects a document', async () => {
    const customer = await login('customer', 'c@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const up = await customer.post(`/api/applications/${created.body._id}/documents`)
      .field('type', 'passport').field('ownerName', 'A')
      .attach('file', Buffer.from('x'), { filename: 'p.pdf', contentType: 'application/pdf' })
    const cust = await User.findOne({ email: 'c@x.com' })
    const legal = await login('legal', 'l@x.com')
    await legal.patch(`/api/staff/documents/${up.body._id}`).send({ status: 'rejected', reason: 'Blurry' })
    const notes = await Notification.find({ userId: cust!._id, type: 'document' })
    expect(notes.length).toBe(1)
    expect(notes[0].body).toContain('Blurry')
  })
})
