import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { Formation } from '../models/Formation.js'
import { hashPassword } from '../lib/auth.js'

const app = createApp()

async function makeUser(role: 'user' | 'admin', email: string) {
  await User.create({
    email,
    passwordHash: await hashPassword('secret123'),
    fullName: role,
    country: 'IN',
    role,
    emailVerified: true,
  })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('admin routes', () => {
  it('forbids non-admins', async () => {
    const agent = await makeUser('user', 'u@x.com')
    const res = await agent.get('/api/admin/formations')
    expect(res.status).toBe(403)
  })

  it('lists all formations and advances status', async () => {
    const user = await makeUser('user', 'u@x.com')
    const created = await user
      .post('/api/formations')
      .send({ entityType: 'SARL', companyName: 'Acme' })
    const admin = await makeUser('admin', 'admin@x.com')

    const list = await admin.get('/api/admin/formations')
    expect(list.status).toBe(200)
    expect(list.body.length).toBe(1)

    const patched = await admin
      .patch(`/api/admin/formations/${created.body._id}/status`)
      .send({ status: 'registered', note: 'done' })
    expect(patched.status).toBe(200)
    expect(patched.body.status).toBe('registered')

    const f = await Formation.findById(created.body._id)
    expect(f!.statusHistory.at(-1)!.note).toBe('done')
  })
})
