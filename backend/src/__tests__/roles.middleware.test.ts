import { describe, it, expect } from 'vitest'
import type { Request, Response } from 'express'
import { requireStaff, requireRole } from '../middleware/roles.js'

function mockRes() {
  const res = { statusCode: 0, body: null as unknown } as unknown as Response & { statusCode: number; body: unknown }
  res.status = (c: number) => { res.statusCode = c; return res }
  res.json = (b: unknown) => { res.body = b; return res }
  return res
}

describe('role middleware', () => {
  it('requireStaff blocks customers, allows staff', () => {
    let called = false
    const next = () => { called = true }
    requireStaff({ userRole: 'customer' } as Request, mockRes(), next)
    expect(called).toBe(false)
    called = false
    requireStaff({ userRole: 'legal' } as Request, mockRes(), next)
    expect(called).toBe(true)
  })
  it('requireRole allows matching role and admin, blocks others', () => {
    let called = false
    const next = () => { called = true }
    requireRole('legal')({ userRole: 'legal' } as Request, mockRes(), next); expect(called).toBe(true)
    called = false
    requireRole('legal')({ userRole: 'admin' } as Request, mockRes(), next); expect(called).toBe(true)
    called = false
    requireRole('legal')({ userRole: 'finance' } as Request, mockRes(), next); expect(called).toBe(false)
  })
})
