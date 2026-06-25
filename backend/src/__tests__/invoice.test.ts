import { describe, it, expect } from 'vitest'
import mongoose from 'mongoose'
import { Application } from '../models/Application.js'
import { upsertInvoice, markInvoicePaid, generateInvoicePdf } from '../lib/invoice.js'
import { Invoice } from '../models/Invoice.js'

async function makeApp() {
  return Application.create({ userId: new mongoose.Types.ObjectId(), serviceKey: 'company-formation', serviceName: 'Company Formation', entityType: 'SARL', companyDetails: { proposedName: 'Acme' }, priceCents: 49900 })
}

describe('invoice lib', () => {
  it('upserts one invoice per application (idempotent invoiceNo) and marks paid', async () => {
    const app = await makeApp()
    const inv1 = await upsertInvoice(app as never, 'stripe')
    const inv2 = await upsertInvoice(app as never, 'bank_transfer')
    expect(inv1.invoiceNo).toBe(inv2.invoiceNo) // same invoice
    expect(await Invoice.countDocuments({ applicationId: app._id })).toBe(1)
    expect(inv2.method).toBe('bank_transfer')
    await markInvoicePaid(app._id)
    const fresh = await Invoice.findOne({ applicationId: app._id })
    expect(fresh!.status).toBe('paid')
  })

  it('generates a PDF buffer', async () => {
    const app = await makeApp()
    const inv = await upsertInvoice(app as never, 'stripe')
    const buf = await generateInvoicePdf(inv, app as never, 'Jo')
    expect(buf.subarray(0, 4).toString()).toBe('%PDF')
  })
})
