import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()

async function setup() {
  await User.create({ email: 'd@x.com', passwordHash: await hashPassword('secret123'), fullName: 'D', country: 'IN', emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'd@x.com', password: 'secret123' })
  const a = await agent.post('/api/applications').send({ entityType: 'SARL', packageTier: 'standard' })
  return { agent, id: a.body._id as string }
}

describe('documents', () => {
  it('uploads a per-owner doc, lists it, and downloads it', async () => {
    const { agent, id } = await setup()
    const up = await agent
      .post(`/api/applications/${id}/documents`)
      .field('type', 'passport')
      .field('ownerName', 'Alice')
      .attach('file', Buffer.from('fake-pdf'), { filename: 'p.pdf', contentType: 'application/pdf' })
    expect(up.status).toBe(201)
    expect(up.body.ownerName).toBe('Alice')

    const list = await agent.get(`/api/applications/${id}/documents`)
    expect(list.body).toHaveLength(1)

    const file = await agent.get(`/api/applications/${id}/documents/${up.body._id}/file`)
    expect(file.status).toBe(200)
    expect(file.text).toBe('fake-pdf')
  })

  it('rejects download for a non-owner non-admin', async () => {
    const { id, agent } = await setup()
    const up = await agent
      .post(`/api/applications/${id}/documents`)
      .field('type', 'passport').field('ownerName', 'A')
      .attach('file', Buffer.from('x'), { filename: 'p.pdf', contentType: 'application/pdf' })
    // second user
    await User.create({ email: 'e@x.com', passwordHash: await hashPassword('secret123'), fullName: 'E', country: 'IN', emailVerified: true })
    const other = request.agent(app)
    await other.post('/api/auth/login').send({ email: 'e@x.com', password: 'secret123' })
    const res = await other.get(`/api/applications/${id}/documents/${up.body._id}/file`)
    expect(res.status).toBe(404)
  })
})
