import { describe, it, expect } from 'vitest'
import { Application } from '../models/Application.js'
import mongoose from 'mongoose'

describe('Application model', () => {
  it('creates with defaults and nested owners', async () => {
    const app = await Application.create({
      userId: new mongoose.Types.ObjectId(),
      entityType: 'SARL',
      packageTier: 'standard',
      companyDetails: { proposedName: 'Acme SARL' },
      owners: [
        { fullName: 'A', role: 'both', nationality: 'India', ownershipPercent: 60, isPrimaryContact: true },
        { fullName: 'B', role: 'shareholder', nationality: 'Chad', ownershipPercent: 40, isPrimaryContact: false },
      ],
      priceCents: 49900,
    })
    expect(app.status).toBe('draft')
    expect(app.currentStep).toBe(1)
    expect(app.companyDetails?.city).toBe("N'Djamena")
    expect(app.virtualOffice?.wanted).toBe(false)
    expect(app.owners).toHaveLength(2)
    expect(app.owners[0].role).toBe('both')
  })

  it('rejects an invalid owner role', async () => {
    await expect(
      Application.create({
        userId: new mongoose.Types.ObjectId(),
        entityType: 'SARL',
        packageTier: 'standard',
        companyDetails: { proposedName: 'X' },
        owners: [{ fullName: 'A', role: 'boss', nationality: 'IN', ownershipPercent: 100, isPrimaryContact: true }],
        priceCents: 1,
      }),
    ).rejects.toThrow()
  })
})
