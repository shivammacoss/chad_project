import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()

async function authedAgent() {
  await User.create({ email: 'u@x.com', passwordHash: await hashPassword('secret123'), fullName: 'U', country: 'IN', emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'u@x.com', password: 'secret123' })
  return agent
}

describe('applications routes', () => {
  it('creates a draft application priced at the entity base', async () => {
    const agent = await authedAgent()
    const res = await agent.post('/api/applications').send({ entityType: 'SARL', packageTier: 'standard' })
    expect(res.status).toBe(201)
    expect(res.body.status).toBe('draft')
    expect(res.body.priceCents).toBe(49900)
    expect(res.body.currentStep).toBe(1)
  })

  it('saves steps and recomputes price with virtual office', async () => {
    const agent = await authedAgent()
    const created = await agent.post('/api/applications').send({ entityType: 'SARL', packageTier: 'standard' })
    const id = created.body._id
    const res = await agent.patch(`/api/applications/${id}`).send({
      companyDetails: { proposedName: 'Acme SARL', businessActivity: 'Trading' },
      owners: [
        { fullName: 'A', role: 'both', nationality: 'India', ownershipPercent: 100, isPrimaryContact: true },
      ],
      virtualOffice: { wanted: true, plan: 'basic' },
      currentStep: 4,
    })
    expect(res.status).toBe(200)
    expect(res.body.companyDetails.proposedName).toBe('Acme SARL')
    expect(res.body.owners).toHaveLength(1)
    expect(res.body.virtualOffice.plan).toBe('basic')
    expect(res.body.priceCents).toBe(69900) // 49900 + 20000
    expect(res.body.currentStep).toBe(4)
  })

  it('lists and fetches my applications, 404 for others', async () => {
    const agent = await authedAgent()
    const created = await agent.post('/api/applications').send({ entityType: 'SA', packageTier: 'standard' })
    const list = await agent.get('/api/applications')
    expect(list.body).toHaveLength(1)
    const one = await agent.get(`/api/applications/${created.body._id}`)
    expect(one.status).toBe(200)
    const bad = await agent.get('/api/applications/64b000000000000000000000')
    expect(bad.status).toBe(404)
  })

  it('creates a generic-service order priced from the registry', async () => {
    const agent = await authedAgent()
    const res = await agent.post('/api/applications').send({ serviceKey: 'virtual-office' })
    expect(res.status).toBe(201)
    expect(res.body.serviceKey).toBe('virtual-office')
    expect(res.body.serviceName).toBe('Virtual Office')
    expect(res.body.priceCents).toBe(20000)
  })

  it('saves intake on a generic order', async () => {
    const agent = await authedAgent()
    const created = await agent.post('/api/applications').send({ serviceKey: 'tax-registration' })
    const res = await agent.patch(`/api/applications/${created.body._id}`).send({ intake: { taxType: 'VAT', companyName: 'Acme' }, currentStep: 2 })
    expect(res.status).toBe(200)
    expect(res.body.intake.taxType).toBe('VAT')
    expect(res.body.priceCents).toBe(25000) // unchanged for generic
  })

  it('rejects an unknown service', async () => {
    const agent = await authedAgent()
    const res = await agent.post('/api/applications').send({ serviceKey: 'nope' })
    expect(res.status).toBe(400)
  })

  it('saves enriched shareholders/directors + capital via PATCH', async () => {
    const agent = await authedAgent()
    const created = await agent.post('/api/applications').send({ entityType: 'SARL', packageTier: 'standard' })
    const res = await agent.patch(`/api/applications/${created.body._id}`).send({
      companyDetails: { proposedName: 'Acme SARL', alternateName2: 'Acme 3', paidUpCapitalFCFA: 500000, currency: 'FCFA' },
      owners: [
        { fullName: 'A', role: 'shareholder', nationality: 'IN', ownershipPercent: 100, passportNo: 'P1', isCorporate: false, isPrimaryContact: true },
        { fullName: 'B', role: 'director', nationality: 'Chad', dob: '1980-01-01', passportNo: 'P2', isPrimaryContact: false },
      ],
      currentStep: 4,
    })
    expect(res.status).toBe(200)
    expect(res.body.companyDetails.paidUpCapitalFCFA).toBe(500000)
    expect(res.body.companyDetails.alternateName2).toBe('Acme 3')
    expect(res.body.owners[1].dob).toBe('1980-01-01')
    expect(res.body.owners[0].passportNo).toBe('P1')
  })
})
