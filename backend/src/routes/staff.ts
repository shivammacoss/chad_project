import { Router } from 'express'
import { Application } from '../models/Application.js'
import { DocumentModel } from '../models/Document.js'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { requireStaff, requireRole } from '../middleware/roles.js'
import { pushStatus } from './applications.js'

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
  res.json(doc)
})

staffRouter.get('/agents', requireRole('legal', 'compliance'), async (_req, res) => {
  const agents = await User.find({ role: 'government_agent' }).select('fullName email')
  res.json(agents)
})
