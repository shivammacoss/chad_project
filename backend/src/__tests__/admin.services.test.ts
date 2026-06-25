import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'
import { seedServicesIfEmpty } from '../lib/serviceStore.js'

const app = createApp()
async function login(role: string, email: string) {
  await User.create({ email, passwordHash: await hashPassword('secret123'), fullName: role, country: 'IN', role, emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email, password: 'secret123' })
  return agent
}

describe('admin services CRUD', () => {
  beforeAll(async () => {
    await seedServicesIfEmpty()
  })

  it('admin lists, creates, updates price + active; public catalog reflects it', async () => {
    const admin = await login('admin', 'a@x.com')
    const all = await admin.get('/api/admin/services')
    expect(all.status).toBe(200)
    expect(all.body.length).toBeGreaterThan(0)

    const created = await admin.post('/api/admin/services').send({ key: 'logo-design', name: 'Logo Design', category: 'Corporate Services', priceCents: 15000 })
    expect(created.status).toBe(201)

    const pub1 = await request(app).get('/api/services')
    expect(pub1.body.find((s: { key: string }) => s.key === 'logo-design')).toBeTruthy()

    await admin.patch('/api/admin/services/logo-design').send({ priceCents: 18000, active: false })
    const pub2 = await request(app).get('/api/services')
    expect(pub2.body.find((s: { key: string }) => s.key === 'logo-design')).toBeFalsy() // inactive hidden
  })

  it('blocks non-admins', async () => {
    const legal = await login('legal', 'l@x.com')
    expect((await legal.get('/api/admin/services')).status).toBe(403)
  })
})
