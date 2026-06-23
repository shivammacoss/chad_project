import { Router } from 'express'
import { Application } from '../models/Application.js'
import { DocumentModel } from '../models/Document.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { pushStatus } from './applications.js'

const ADMIN_STATUSES = ['in_review', 'filing_submitted', 'registered', 'needs_more_docs', 'rejected']

export const adminRouter = Router()
adminRouter.use(requireAuth, requireAdmin)

adminRouter.get('/applications', async (req, res) => {
  const filter = req.query.status ? { status: String(req.query.status) } : {}
  const list = await Application.find(filter).sort({ createdAt: -1 }).populate('userId', 'email fullName')
  res.json(list)
})

adminRouter.patch('/applications/:id/status', async (req, res) => {
  const { status, note } = req.body ?? {}
  if (!ADMIN_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid admin status' })
  const app = await Application.findById(req.params.id)
  if (!app) return res.status(404).json({ error: 'Not found' })
  pushStatus(app, status, note)
  await app.save()
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
