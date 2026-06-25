import { describe, it, expect, beforeEach, vi } from 'vitest'
import mongoose from 'mongoose'
import { Application } from '../models/Application.js'
import { Notification } from '../models/Notification.js'
import { __setTransport } from '../lib/email.js'
import { runRenewalReminders } from '../lib/renewals.js'

beforeEach(() => { __setTransport({ sendMail: vi.fn(async () => ({})) }) })

async function makeRegistered(daysToExpiry: number) {
  return Application.create({
    userId: new mongoose.Types.ObjectId(), serviceKey: 'company-formation', serviceName: 'Company Formation',
    entityType: 'SARL', companyDetails: { proposedName: 'Acme SARL' }, priceCents: 49900,
    status: 'registered', expiresAt: new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000),
  })
}

describe('runRenewalReminders', () => {
  it('sends one reminder for a company expiring in 30 days, then nothing on re-run', async () => {
    const app = await makeRegistered(30)
    const r1 = await runRenewalReminders()
    expect(r1.sent).toBe(1)
    expect(await Notification.countDocuments({ userId: app.userId, title: 'Renewal due' })).toBe(1)
    const r2 = await runRenewalReminders()
    expect(r2.sent).toBe(0)
    const fresh = await Application.findById(app._id)
    expect(fresh!.remindersSent).toContain(30)
  })

  it('ignores companies more than 90 days out', async () => {
    await makeRegistered(200)
    const r = await runRenewalReminders()
    expect(r.sent).toBe(0)
  })
})
