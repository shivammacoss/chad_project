import { Router } from 'express'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Application } from '../models/Application.js'
import { DocumentModel } from '../models/Document.js'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { requireStaff, requireRole } from '../middleware/roles.js'
import { notifyUser } from '../lib/notify.js'
import { pushStatus } from './applications.js'
import { generateCertificatePdf } from '../lib/certificate.js'
import { markInvoicePaid } from '../lib/invoice.js'

export const staffRouter = Router()
staffRouter.use(requireAuth, requireStaff)

staffRouter.get('/applications', async (req, res) => {
  const filter: Record<string, unknown> = {}
  if (req.query.status) filter.status = String(req.query.status)
  if (req.query.assigned === 'me') filter.assignedAgentId = req.userId
  const list = await Application.find(filter).sort({ createdAt: -1 })
    .populate('userId', 'email fullName').populate('assignedAgentId', 'fullName email')
  res.json(list)
})

staffRouter.get('/applications/:id', async (req, res) => {
  const app = await Application.findById(req.params.id)
    .populate('userId', 'email fullName').populate('assignedAgentId', 'fullName email')
  if (!app) return res.status(404).json({ error: 'Not found' })
  res.json(app)
})

staffRouter.get('/applications/:id/documents', async (req, res) => {
  const docs = await DocumentModel.find({ applicationId: req.params.id }).sort({ uploadedAt: 1 })
  res.json(docs)
})

staffRouter.patch('/applications/:id/status', async (req, res) => {
  const { status, note } = req.body ?? {}
  if (!status) return res.status(400).json({ error: 'status required' })
  const app = await Application.findById(req.params.id)
  if (!app) return res.status(404).json({ error: 'Not found' })
  pushStatus(app, status, note)
  await app.save()
  res.json(app)
})

staffRouter.patch('/applications/:id/assign', requireRole('legal', 'compliance'), async (req, res) => {
  const { agentId } = req.body ?? {}
  const app = await Application.findByIdAndUpdate(req.params.id, { assignedAgentId: agentId ?? null }, { new: true })
    .populate('assignedAgentId', 'fullName email')
  if (!app) return res.status(404).json({ error: 'Not found' })
  res.json(app)
})

staffRouter.patch('/documents/:id', async (req, res) => {
  const { status, reason } = req.body ?? {}
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' })
  const update: Record<string, unknown> = { status }
  if (status === 'rejected') update.rejectionReason = reason ?? ''
  const doc = await DocumentModel.findByIdAndUpdate(req.params.id, update, { new: true })
  if (!doc) return res.status(404).json({ error: 'Not found' })
  if (doc && status === 'rejected') {
    const parent = await Application.findById(doc.applicationId).select('userId')
    if (parent) await notifyUser(parent.userId, { type: 'document', title: 'A document needs attention', body: reason || 'Please re-upload the requested document.', link: `/applications/${doc.applicationId}` })
  }
  res.json(doc)
})

staffRouter.get('/agents', requireRole('legal', 'compliance'), async (_req, res) => {
  const agents = await User.find({ role: 'government_agent' }).select('fullName email')
  res.json(agents)
})

staffRouter.post('/applications/:id/confirm-payment', async (req, res) => {
  const app = await Application.findById(req.params.id)
  if (!app) return res.status(404).json({ error: 'Not found' })
  app.paymentStatus = 'paid'
  pushStatus(app, 'paid', 'Bank transfer confirmed')
  await app.save()
  await markInvoicePaid(app._id)
  await notifyUser(app.userId, { type: 'payment', title: 'Payment received', body: `Your bank transfer for ${app.serviceName} was confirmed.`, link: `/applications/${app._id}` })
  res.json(app)
})

staffRouter.post('/applications/:id/issue-certificate', async (req, res) => {
  const app = await Application.findById(req.params.id).populate('userId', 'fullName email')
  if (!app) return res.status(404).json({ error: 'Not found' })
  if (!app.companyRegNo) {
    const seq = (await Application.countDocuments({ companyRegNo: { $ne: null } })) + 1
    app.companyRegNo = `RCCM/NDJ/${new Date().getFullYear()}/B-${String(seq).padStart(4, '0')}`
  }
  app.registeredAt = new Date()
  app.expiresAt = new Date(app.registeredAt.getTime() + 365 * 24 * 60 * 60 * 1000)
  pushStatus(app, 'registered', `Certificate issued (${app.companyRegNo})`)
  await app.save()

  const applicantName = (app.userId as unknown as { fullName?: string })?.fullName ?? 'Applicant'
  // userId is populated above; use its _id for downstream writes.
  const applicantId = (app.userId as unknown as { _id?: unknown })?._id ?? app.userId
  const pdf = await generateCertificatePdf(app as never, applicantName)
  const dir = join(process.cwd(), 'uploads', String(app._id))
  mkdirSync(dir, { recursive: true })
  const filePath = join(dir, 'certificate.pdf')
  writeFileSync(filePath, pdf)

  const existing = await DocumentModel.findOne({ applicationId: app._id, type: 'certificate', fileName: 'certificate-of-incorporation.pdf' })
  if (existing) { existing.storagePath = filePath; existing.status = 'approved'; await existing.save() }
  else {
    await DocumentModel.create({ applicationId: app._id, userId: applicantId, ownerName: '', type: 'certificate', fileName: 'certificate-of-incorporation.pdf', storagePath: filePath, status: 'approved' })
  }

  await notifyUser(applicantId, { type: 'certificate', title: 'Your company is registered!', body: `Certificate ${app.companyRegNo} is ready to download.`, link: `/applications/${app._id}` })
  res.json(app)
})
