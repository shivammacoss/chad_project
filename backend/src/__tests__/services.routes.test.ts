import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'

describe('GET /api/services', () => {
  it('returns the service catalog without auth', async () => {
    const res = await request(createApp()).get('/api/services')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    const formation = res.body.find((s: { key: string }) => s.key === 'company-formation')
    expect(formation.flow).toBe('formation')
    const vo = res.body.find((s: { key: string }) => s.key === 'virtual-office')
    expect(vo.flow).toBe('generic')
    expect(vo.intakeFields.length).toBeGreaterThan(0)
  })
})
