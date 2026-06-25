import { Router } from 'express'
import { Invoice } from '../models/Invoice.js'
import { Application } from '../models/Application.js'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { generateInvoicePdf } from '../lib/invoice.js'

export const invoicesRouter = Router()
invoicesRouter.use(requireAuth)

invoicesRouter.get('/', async (req, res) => {
  const list = await Invoice.find({ userId: req.userId }).sort({ issuedAt: -1 })
  res.json(list)
})

invoicesRouter.get('/:id/pdf', async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
  if (!invoice) return res.status(404).json({ error: 'Not found' })
  const isOwner = String(invoice.userId) === req.userId
  const isStaff = req.userRole && !['customer', 'user'].includes(req.userRole)
  if (!isOwner && !isStaff) return res.status(404).json({ error: 'Not found' })
  const app = await Application.findById(invoice.applicationId)
  if (!app) return res.status(404).json({ error: 'Application missing' })
  const user = await User.findById(invoice.userId).select('fullName')
  const pdf = await generateInvoicePdf(invoice, app, user?.fullName ?? 'Customer')
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNo.replace(/\//g, '-')}.pdf"`)
  res.send(pdf)
})
