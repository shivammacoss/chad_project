import { describe, it, expect } from 'vitest'
import { generateCertificatePdf } from '../lib/certificate.js'

describe('generateCertificatePdf', () => {
  it('produces a non-empty PDF buffer', async () => {
    const app = {
      entityType: 'SARL', companyRegNo: 'RCCM/NDJ/2026/B-0001',
      companyDetails: { proposedName: 'Acme SARL', city: "N'Djamena", businessActivity: 'Trading', shareCapitalFCFA: 1000000, paidUpCapitalFCFA: 500000, currency: 'FCFA' },
      owners: [{ fullName: 'A', role: 'shareholder', nationality: 'IN', ownershipPercent: 100 }, { fullName: 'B', role: 'director', nationality: 'Chad' }],
    } as never
    const buf = await generateCertificatePdf(app, 'Jo Customer')
    expect(buf.length).toBeGreaterThan(500)
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
  })
})
