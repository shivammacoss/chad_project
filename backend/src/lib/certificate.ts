import PDFDocument from 'pdfkit'
import type { IApplication } from '../models/Application.js'

type AppLike = IApplication & { companyRegNo?: string | null; registeredAt?: Date | null }

export function generateCertificatePdf(app: AppLike, applicantName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const cd = app.companyDetails ?? ({} as NonNullable<AppLike['companyDetails']>)
    const regNo = app.companyRegNo ?? '—'
    const issued = app.registeredAt ? new Date(app.registeredAt) : new Date()

    doc.fontSize(10).fillColor('#555').text('REPUBLIC OF CHAD', { align: 'center' })
    doc.moveDown(0.2).fontSize(9).fillColor('#888').text('Chad Business Assist — Online Incorporation Platform', { align: 'center' })
    doc.moveDown(1.2)
    doc.fontSize(22).fillColor('#0B1220').text('Certificate of Incorporation', { align: 'center' })
    doc.moveDown(0.3).fontSize(11).fillColor('#444').text('OHADA — SARL / SA / Branch / Representative Office', { align: 'center' })
    doc.moveDown(1.5)

    doc.fontSize(12).fillColor('#0B1220')
    doc.text('This is to certify that the company named below has been duly registered:', { align: 'left' })
    doc.moveDown(1)

    const row = (label: string, value: string) => {
      doc.fontSize(11).fillColor('#666').text(label, { continued: true }).fillColor('#0B1220').text('  ' + value)
      doc.moveDown(0.4)
    }
    row('Company name:', cd.proposedName ?? '—')
    row('Entity type:', String(app.entityType ?? '—'))
    row('Registration number:', regNo)
    row('Date of incorporation:', issued.toISOString().slice(0, 10))
    row('Registered office:', cd.city ?? "N'Djamena")
    row('Business activity:', cd.businessActivity ?? '—')
    row('Share capital:', `${(cd.shareCapitalFCFA ?? 0).toLocaleString()} ${cd.currency ?? 'FCFA'} (paid-up ${(cd.paidUpCapitalFCFA ?? 0).toLocaleString()})`)
    row('Applicant:', applicantName)

    const shareholders = (app.owners ?? []).filter((o) => o.role === 'shareholder' || o.role === 'both')
    const directors = (app.owners ?? []).filter((o) => o.role === 'director' || o.role === 'both')
    doc.moveDown(0.6).fontSize(11).fillColor('#666').text('Shareholders:')
    if (shareholders.length === 0) doc.fillColor('#0B1220').text('  —')
    shareholders.forEach((s) => doc.fillColor('#0B1220').text(`  • ${s.fullName} (${s.nationality}) — ${s.ownershipPercent ?? 0}%`))
    doc.moveDown(0.4).fontSize(11).fillColor('#666').text('Directors:')
    if (directors.length === 0) doc.fillColor('#0B1220').text('  —')
    directors.forEach((d) => doc.fillColor('#0B1220').text(`  • ${d.fullName} (${d.nationality})`))

    doc.moveDown(2)
    doc.fontSize(10).fillColor('#888').text(`Issued on ${issued.toISOString().slice(0, 10)} via Chad Business Assist. This document is computer-generated.`, { align: 'center' })

    doc.end()
  })
}
