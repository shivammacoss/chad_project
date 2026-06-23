import { describe, it, expect } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  makeVerifyToken,
  hashToken,
} from '../lib/auth.js'

describe('auth lib', () => {
  it('hashes and verifies passwords', async () => {
    const h = await hashPassword('secret123')
    expect(await verifyPassword('secret123', h)).toBe(true)
    expect(await verifyPassword('wrong', h)).toBe(false)
  })

  it('signs and verifies jwt', () => {
    const t = signToken({ sub: 'abc', role: 'user' })
    expect(verifyToken(t).sub).toBe('abc')
  })

  it('makes a verify token whose raw hashes to the stored value', () => {
    const { raw, hashed } = makeVerifyToken()
    expect(hashToken(raw)).toBe(hashed)
  })
})
