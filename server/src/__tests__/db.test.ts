import { describe, it, expect } from 'vitest'
import mongoose from 'mongoose'

describe('database connection', () => {
  it('is connected during tests', () => {
    expect(mongoose.connection.readyState).toBe(1)
  })
})
