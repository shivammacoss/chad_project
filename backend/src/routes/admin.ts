import { Router } from 'express'
import { Formation } from '../models/Formation.js'
import { DocumentModel } from '../models/Document.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { pushStatus } from './formations.js'

const ADMIN_STATUSES = [
  'in_review',
  'filing_submitted',
  'registered',
  'needs_more_docs',
  'rejected',
]

export const adminRouter = Router()
adminRouter.use(requireAuth, requireAdmin)

adminRouter.get('/formations', async (req, res) => {
  const filter = req.query.status ? { status: String(req.query.status) } : {}
  const list = await Formation.find(filter)
    .sort({ createdAt: -1 })
    .populate('userId', 'email fullName')
  res.json(list)
})

adminRouter.patch('/formations/:id/status', async (req, res) => {
  const { status, note } = req.body ?? {}
  if (!ADMIN_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid admin status' })
  }
  const f = await Formation.findById(req.params.id)
  if (!f) return res.status(404).json({ error: 'Not found' })
  pushStatus(f, status, note)
  await f.save()
  res.json(f)
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
