import { describe, it, expect } from 'vitest'
import { priceFor, virtualOfficeAddon, totalPrice } from '../lib/pricing.js'

describe('pricing', () => {
  it('keeps base entity pricing', () => {
    expect(priceFor('SARL', 'standard')).toBe(49900)
    expect(priceFor('SARL', 'premium')).toBe(79900)
  })
  it('prices the virtual office add-on', () => {
    expect(virtualOfficeAddon()).toBe(0)
    expect(virtualOfficeAddon('basic')).toBe(20000)
    expect(virtualOfficeAddon('premium')).toBe(50000)
  })
  it('totals entity + tier + virtual office', () => {
    expect(totalPrice('SARL', 'standard', { wanted: true, plan: 'basic' })).toBe(69900)
    expect(totalPrice('SARL', 'standard', { wanted: false })).toBe(49900)
  })
})
