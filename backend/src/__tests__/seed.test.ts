import { describe, it, expect } from 'vitest'
import { seedDemo } from '../seed.js'
import { User } from '../models/User.js'
import { Application } from '../models/Application.js'

describe('seedDemo', () => {
  it('creates admin, user and rich applications', async () => {
    await seedDemo()
    expect(await User.countDocuments({ role: 'admin' })).toBe(1)
    expect(await Application.countDocuments()).toBe(4)
    const registered = await Application.findOne({ status: 'registered' })
    expect(registered).toBeDefined()
    expect(registered?.owners.length).toBe(2)
    expect(registered?.virtualOffice?.wanted).toBe(true)
  })
})
