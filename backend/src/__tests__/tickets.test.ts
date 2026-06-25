import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'
import { __setTransport } from '../lib/email.js'

const app = createApp()
beforeEach(() => { __setTransport({ sendMail: vi.fn(async () => ({})) }) })
async function login(role: string, email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('support tickets', () => {
  it('customer creates a ticket; staff replies; thread grows', async () => {
    const customer = await login('customer', 'c@x.com')
    const created = await customer.post('/api/tickets').send({ category: 'documents', subject: 'Help', body: 'My passport upload failed' })
    expect(created.status).toBe(201)
    expect(created.body.messages.length).toBe(1)

    const support = await login('support', 's@x.com')
    const list = await support.get('/api/staff/tickets')
    expect(list.body.length).toBe(1)
    const reply = await support.post(`/api/staff/tickets/${created.body._id}/messages`).send({ body: 'Please try a PDF.' })
    expect(reply.body.messages.length).toBe(2)
    const closed = await support.patch(`/api/staff/tickets/${created.body._id}`).send({ status: 'closed' })
    expect(closed.body.status).toBe('closed')
  })

  it('a customer cannot read another customer ticket', async () => {
    const a = await login('customer', 'a@x.com')
    const t = await a.post('/api/tickets').send({ category: 'other', subject: 'x', body: 'y' })
    const b = await login('customer', 'b@x.com')
    expect((await b.get(`/api/tickets/${t.body._id}`)).status).toBe(404)
  })
})
