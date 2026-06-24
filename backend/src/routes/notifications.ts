import { Router } from 'express'
import { Notification } from '../models/Notification.js'
import { requireAuth } from '../middleware/auth.js'

export const notificationsRouter = Router()
notificationsRouter.use(requireAuth)

notificationsRouter.get('/', async (req, res) => {
  const list = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50)
  res.json(list)
})

notificationsRouter.get('/unread-count', async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.userId, read: false })
  res.json({ count })
})

notificationsRouter.patch('/:id/read', async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { read: true }, { new: true })
  if (!n) return res.status(404).json({ error: 'Not found' })
  res.json(n)
})

notificationsRouter.patch('/read-all', async (req, res) => {
  await Notification.updateMany({ userId: req.userId, read: false }, { read: true })
  res.json({ ok: true })
})
