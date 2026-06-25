import { Router } from 'express'
import { Ticket } from '../models/Ticket.js'
import { requireAuth } from '../middleware/auth.js'

export const ticketsRouter = Router()
ticketsRouter.use(requireAuth)

ticketsRouter.post('/', async (req, res) => {
  const { category, subject, body } = req.body ?? {}
  if (!subject || !body) return res.status(400).json({ error: 'subject and body required' })
  const ticket = await Ticket.create({
    userId: req.userId,
    category: ['legal', 'payment', 'documents', 'technical', 'other'].includes(category) ? category : 'other',
    subject,
    messages: [{ authorId: req.userId, authorRole: req.userRole ?? 'customer', body, at: new Date() }],
  })
  res.status(201).json(ticket)
})

ticketsRouter.get('/', async (req, res) => {
  res.json(await Ticket.find({ userId: req.userId }).sort({ updatedAt: -1 }))
})

ticketsRouter.get('/:id', async (req, res) => {
  const t = await Ticket.findOne({ _id: req.params.id, userId: req.userId })
  if (!t) return res.status(404).json({ error: 'Not found' })
  res.json(t)
})

ticketsRouter.post('/:id/messages', async (req, res) => {
  const { body } = req.body ?? {}
  if (!body) return res.status(400).json({ error: 'body required' })
  const t = await Ticket.findOne({ _id: req.params.id, userId: req.userId })
  if (!t) return res.status(404).json({ error: 'Not found' })
  t.messages.push({ authorId: req.userId as never, authorRole: req.userRole ?? 'customer', body, at: new Date() })
  t.status = 'open'
  t.updatedAt = new Date()
  await t.save()
  res.json(t)
})
