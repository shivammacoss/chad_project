import { describe, it, expect } from 'vitest'
import { User } from '../models/User.js'

describe('User model', () => {
  it('creates a user with defaults', async () => {
    const u = await User.create({
      email: 'A@Example.com',
      passwordHash: 'x',
      fullName: 'Test',
      country: 'India',
    })
    expect(u.email).toBe('a@example.com') // lowercased
    expect(u.role).toBe('customer')
    expect(u.emailVerified).toBe(false)
  })

  it('enforces unique email', async () => {
    const base = { passwordHash: 'x', fullName: 'T', country: 'IN' }
    await User.create({ email: 'dup@x.com', ...base })
    await expect(User.create({ email: 'dup@x.com', ...base })).rejects.toThrow()
  })
})
