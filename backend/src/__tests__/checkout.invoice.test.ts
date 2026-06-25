import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { Application } from '../models/Application.js'
import { Invoice } from '../models/Invoice.js'
import { hashPassword } from '../lib/auth.js'
import { __setStripe } from '../lib/stripe.js'
import { __setTransport } from '../lib/email.js'

const app = createApp()
beforeEach(() => {
  __setTransport({ sendMail: vi.fn(async () => ({})) })
  __setStripe({ checkout: { sessions: { create: vi.fn(async () => ({ id: 'cs_1', url: 'https://stripe.test/pay' })) } }, webhooks: { constructEvent: () => ({ type: 'x', data: { object: {} } }) as never } })
})
async function login(role: string, email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('checkout invoices + bank transfer', () => {
  it('bank transfer returns bank details + creates an unpaid invoice', async () => {
    const customer = await login('customer', 'c@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const res = await customer.post(`/api/applications/${created.body._id}/checkout`).send({ method: 'bank_transfer' })
    expect(res.status).toBe(200)
    expect(res.body.method).toBe('bank_transfer')
    expect(res.body.bankDetails.accountNumber).toBeTruthy()
    const inv = await Invoice.findOne({ applicationId: created.body._id })
    expect(inv!.status).toBe('unpaid')
    expect(inv!.method).toBe('bank_transfer')
  })

  it('staff confirm-payment marks the app + invoice paid', async () => {
    const customer = await login('customer', 'c2@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    await customer.post(`/api/applications/${created.body._id}/checkout`).send({ method: 'bank_transfer' })
    const legal = await login('legal', 'l@x.com')
    const res = await legal.post(`/api/staff/applications/${created.body._id}/confirm-payment`)
    expect(res.status).toBe(200)
    const app2 = await Application.findById(created.body._id)
    expect(app2!.paymentStatus).toBe('paid')
    const inv = await Invoice.findOne({ applicationId: created.body._id })
    expect(inv!.status).toBe('paid')
  })

  it('lists my invoices', async () => {
    const customer = await login('customer', 'c3@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    await customer.post(`/api/applications/${created.body._id}/checkout`).send({ method: 'bank_transfer' })
    const list = await customer.get('/api/invoices')
    expect(list.body.length).toBe(1)
  })
})
