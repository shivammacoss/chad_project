import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { Application } from '../models/Application.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()
async function loginAs(role: string, email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role + ' user', country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('certificate endpoints', () => {
  it('issues a certificate and downloads the PDF', async () => {
    const customer = await loginAs('customer', 'c@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const id = created.body._id

    const before = await customer.get(`/api/applications/${id}/certificate.pdf`)
    expect(before.status).toBe(404) // not issued yet

    const legal = await loginAs('legal', 'l@x.com')
    const issued = await legal.post(`/api/staff/applications/${id}/issue-certificate`)
    expect(issued.status).toBe(200)
    expect(issued.body.companyRegNo).toMatch(/^RCCM\/NDJ\/\d{4}\/B-\d{4}$/)
    expect(issued.body.registeredAt).toBeTruthy()

    const certDocs = await legal.get(`/api/staff/applications/${id}/documents`)
    expect(certDocs.body.some((d: { type: string }) => d.type === 'certificate')).toBe(true)

    const pdf = await customer.get(`/api/applications/${id}/certificate.pdf`)
    expect(pdf.status).toBe(200)
    expect(pdf.headers['content-type']).toContain('application/pdf')

    const app2 = await Application.findById(id)
    expect(app2!.status).toBe('registered')
  })

  it('blocks a non-owner non-staff from downloading', async () => {
    const customer = await loginAs('customer', 'owner@x.com')
    const created = await customer.post('/api/applications').send({ serviceKey: 'company-formation', entityType: 'SARL', packageTier: 'standard' })
    const legal = await loginAs('legal', 'l2@x.com')
    await legal.post(`/api/staff/applications/${created.body._id}/issue-certificate`)
    const other = await loginAs('customer', 'other@x.com')
    const res = await other.get(`/api/applications/${created.body._id}/certificate.pdf`)
    expect(res.status).toBe(404)
  })
})
