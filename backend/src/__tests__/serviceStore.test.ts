import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { Service } from '../models/Service.js'
import { listServices, getServiceDef } from '../lib/serviceStore.js'

const app = createApp()

describe('serviceStore', () => {
  it('seeds the catalog and lists active services', async () => {
    const list = await listServices(true)
    expect(list.length).toBeGreaterThan(0)
    expect(list.find((s) => s.key === 'company-formation')).toBeTruthy()
    expect(await Service.countDocuments({})).toBeGreaterThan(0)
  })
  it('GET /api/services returns DB services', async () => {
    const res = await request(app).get('/api/services')
    expect(res.status).toBe(200)
    expect(res.body.find((s: { key: string }) => s.key === 'virtual-office')).toBeTruthy()
  })
  it('getServiceDef returns null for inactive/unknown', async () => {
    await listServices() // ensure seeded
    await Service.findOneAndUpdate({ key: 'trademark' }, { active: false })
    expect(await getServiceDef('trademark')).toBeNull()
    expect(await getServiceDef('nope')).toBeNull()
  })
})
