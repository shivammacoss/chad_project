import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { Application } from '../models/Application.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()

async function makeUser(role: 'user' | 'admin', email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('admin routes', () => {
  it('forbids non-admins', async () => {
    const agent = await makeUser('user', 'u@x.com')
    expect((await agent.get('/api/admin/applications')).status).toBe(403)
  })

  it('lists applications and advances status', async () => {
    const user = await makeUser('user', 'u@x.com')
    const created = await user.post('/api/applications').send({ entityType: 'SARL', packageTier: 'standard' })
    const admin = await makeUser('admin', 'admin@x.com')
    const list = await admin.get('/api/admin/applications')
    expect(list.status).toBe(200)
    expect(list.body.length).toBe(1)
    const patched = await admin.patch(`/api/admin/applications/${created.body._id}/status`).send({ status: 'registered', note: 'done' })
    expect(patched.status).toBe(200)
    expect(patched.body.status).toBe('registered')
    const a = await Application.findById(created.body._id)
    expect(a!.statusHistory.at(-1)!.note).toBe('done')
  })

  it('fetches one application and its documents as admin', async () => {
    const user = await makeUser('user', 'u2@x.com')
    const created = await user.post('/api/applications').send({ entityType: 'SARL', packageTier: 'standard' })
    await user
      .post(`/api/applications/${created.body._id}/documents`)
      .field('type', 'passport').field('ownerName', 'Alice')
      .attach('file', Buffer.from('x'), { filename: 'p.pdf', contentType: 'application/pdf' })
    const admin = await makeUser('admin', 'admin2@x.com')
    const one = await admin.get(`/api/admin/applications/${created.body._id}`)
    expect(one.status).toBe(200)
    expect(one.body.entityType).toBe('SARL')
    const docs = await admin.get(`/api/admin/applications/${created.body._id}/documents`)
    expect(docs.status).toBe(200)
    expect(docs.body).toHaveLength(1)
    expect(docs.body[0].ownerName).toBe('Alice')
  })
})
