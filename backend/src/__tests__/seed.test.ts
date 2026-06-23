import { describe, it, expect } from 'vitest'
import { seedDemo } from '../seed.js'
import { User } from '../models/User.js'
import { Formation } from '../models/Formation.js'

describe('seedDemo', () => {
  it('creates admin, user and demo formations', async () => {
    await seedDemo()
    expect(await User.countDocuments({ role: 'admin' })).toBe(1)
    expect(await Formation.countDocuments()).toBe(4)
    expect(await Formation.countDocuments({ status: 'registered' })).toBe(1)
  })
})
