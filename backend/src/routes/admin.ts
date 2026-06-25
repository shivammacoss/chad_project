import { Router } from 'express'
import { Application } from '../models/Application.js'
import { DocumentModel } from '../models/Document.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { logAudit } from '../lib/audit.js'
import { AuditLog } from '../models/AuditLog.js'
import { pushStatus } from './applications.js'
import { runRenewalReminders } from '../lib/renewals.js'
import { Service } from '../models/Service.js'

const ADMIN_STATUSES = ['in_review', 'filing_submitted', 'registered', 'needs_more_docs', 'rejected']

export const adminRouter = Router()
adminRouter.use(requireAuth, requireAdmin)

adminRouter.get('/applications', async (req, res) => {
  const filter = req.query.status ? { status: String(req.query.status) } : {}
  const list = await Application.find(filter).sort({ createdAt: -1 }).populate('userId', 'email fullName')
  res.json(list)
})

adminRouter.get('/applications/:id', async (req, res) => {
  const app = await Application.findById(req.params.id).populate('userId', 'email fullName')
  if (!app) return res.status(404).json({ error: 'Not found' })
  res.json(app)
})

adminRouter.get('/applications/:id/documents', async (req, res) => {
  const docs = await DocumentModel.find({ applicationId: req.params.id }).sort({ uploadedAt: 1 })
  res.json(docs)
})

adminRouter.patch('/applications/:id/status', async (req, res) => {
  const { status, note } = req.body ?? {}
  if (!ADMIN_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid admin status' })
  const app = await Application.findById(req.params.id)
  if (!app) return res.status(404).json({ error: 'Not found' })
  pushStatus(app, status, note)
  await app.save()
  await logAudit(req, 'application.status', `application:${req.params.id}`, { to: status })
  res.json(app)
})

adminRouter.patch('/documents/:id', async (req, res) => {
  const { status } = req.body ?? {}
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  const doc = await DocumentModel.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  )
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
})

adminRouter.post('/run-renewal-check', async (_req, res) => {
  const result = await runRenewalReminders()
  res.json(result)
})

adminRouter.get('/audit', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 100)
  const list = await AuditLog.find({}).sort({ at: -1 }).limit(limit).populate('actorId', 'email fullName')
  res.json(list)
})

adminRouter.get('/services', async (_req, res) => {
  res.json(await Service.find({}).sort({ category: 1, name: 1 }))
})

adminRouter.post('/services', async (req, res) => {
  const { key, name, priceCents } = req.body ?? {}
  if (!key || !name || typeof priceCents !== 'number') return res.status(400).json({ error: 'key, name, priceCents required' })
  if (await Service.findOne({ key })) return res.status(409).json({ error: 'key exists' })
  const svc = await Service.create({
    key, name, category: req.body.category ?? '', blurb: req.body.blurb ?? '',
    priceCents, flow: req.body.flow === 'formation' ? 'formation' : 'generic',
    country: req.body.country ?? 'TD',
    requiredDocuments: req.body.requiredDocuments ?? [], intakeFields: req.body.intakeFields ?? [],
  })
  await logAudit(req, 'service.create', `service:${key}`, { priceCents })
  res.status(201).json(svc)
})

adminRouter.patch('/services/:key', async (req, res) => {
  const allowed: Record<string, unknown> = {}
  for (const f of ['name', 'priceCents', 'blurb', 'active', 'requiredDocuments', 'category', 'country']) {
    if (req.body?.[f] !== undefined) allowed[f] = req.body[f]
  }
  const svc = await Service.findOneAndUpdate({ key: req.params.key }, allowed, { new: true })
  if (!svc) return res.status(404).json({ error: 'Not found' })
  await logAudit(req, 'service.update', `service:${req.params.key}`, allowed)
  res.json(svc)
})
