import PDFDocument from 'pdfkit'
import { Invoice, type IInvoice } from '../models/Invoice.js'
import type { IApplication } from '../models/Application.js'

export async function upsertInvoice(app: IApplication & { _id: unknown }, method: 'stripe' | 'bank_transfer') {
  const existing = await Invoice.findOne({ applicationId: app._id })
  if (existing) {
    existing.method = method
    await existing.save()
    return existing
  }
  const seq = (await Invoice.countDocuments({})) + 1
  return Invoice.create({
    invoiceNo: `INV/${new Date().getFullYear()}/${String(seq).padStart(4, '0')}`,
    applicationId: app._id,
    userId: app.userId,
    serviceName: app.serviceName,
    amountCents: app.priceCents,
    currency: 'USD',
    method,
    status: 'unpaid',
  })
}

export async function markInvoicePaid(applicationId: unknown): Promise<void> {
  await Invoice.findOneAndUpdate({ applicationId }, { status: 'paid', paidAt: new Date() })
}

export function generateInvoicePdf(invoice: IInvoice, app: IApplication, applicantName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const amount = `$${(invoice.amountCents / 100).toFixed(2)}`
    doc.fontSize(20).fillColor('#0B1220').text('INVOICE', { align: 'left' })
    doc.fontSize(10).fillColor('#888').text('Chad Business Assist', { align: 'left' })
    doc.moveDown(1)
    doc.fontSize(11).fillColor('#0B1220')
    doc.text(`Invoice no: ${invoice.invoiceNo}`)
    doc.text(`Date: ${new Date(invoice.issuedAt).toISOString().slice(0, 10)}`)
    doc.text(`Bill to: ${applicantName}`)
    doc.text(`Status: ${invoice.status.toUpperCase()} (${invoice.method})`)
    doc.moveDown(1)
    doc.fontSize(12).fillColor('#0B1220').text('Description', 56, doc.y, { continued: true }).text(amount, { align: 'right' })
    doc.moveDown(0.3).fontSize(11).fillColor('#444')
    doc.text(`${invoice.serviceName}${app.entityType ? ' — ' + app.entityType : ''} (${app.companyDetails?.proposedName ?? ''})`, { width: 360 })
    doc.moveDown(1)
    doc.fontSize(13).fillColor('#0B1220').text(`Total: ${amount} ${invoice.currency}`, { align: 'right' })
    doc.moveDown(2)
    doc.fontSize(9).fillColor('#888').text('Thank you for your business. This invoice is computer-generated.', { align: 'center' })
    doc.end()
  })
}
