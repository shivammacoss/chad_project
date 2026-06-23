import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()

async function setup() {
  await User.create({
    email: 'd@x.com',
    passwordHash: await hashPassword('secret123'),
    fullName: 'D',
    country: 'IN',
    emailVerified: true,
  })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'd@x.com', password: 'secret123' })
  const f = await agent
    .post('/api/formations')
    .send({ entityType: 'SARL', companyName: 'Acme' })
  return { agent, formationId: f.body._id as string }
}

describe('documents', () => {
  it('uploads and lists a document', async () => {
    const { agent, formationId } = await setup()
    const up = await agent
      .post(`/api/formations/${formationId}/documents`)
      .field('type', 'passport')
      .attach('file', Buffer.from('fake-pdf'), {
        filename: 'passport.pdf',
        contentType: 'application/pdf',
      })
    expect(up.status).toBe(201)
    expect(up.body.type).toBe('passport')
    expect(up.body.status).toBe('pending')

    const list = await agent.get(`/api/formations/${formationId}/documents`)
    expect(list.body).toHaveLength(1)
  })

  it('rejects upload with no file', async () => {
    const { agent, formationId } = await setup()
    const up = await agent
      .post(`/api/formations/${formationId}/documents`)
      .field('type', 'passport')
    expect(up.status).toBe(400)
  })
})
