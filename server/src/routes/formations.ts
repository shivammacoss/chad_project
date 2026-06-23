import { Router } from 'express'
import type { HydratedDocument } from 'mongoose'
import { Formation, type IFormation } from '../models/Formation.js'
import { priceFor, type EntityType, type Tier } from '../lib/pricing.js'
import { requireAuth } from '../middleware/auth.js'
import { documentsRouter } from './documents.js'

export function pushStatus(
  formation: HydratedDocument<IFormation>,
  status: string,
  note?: string,
): void {
  formation.status = status as IFormation['status']
  formation.statusHistory.push({ status, note, at: new Date() })
}

export const formationsRouter = Router()
formationsRouter.use(requireAuth)

formationsRouter.post('/', async (req, res) => {
  const { entityType, companyName, packageTier } = req.body ?? {}
  const valid: EntityType[] = ['SARL', 'SARL_U', 'SA', 'BRANCH', 'REP_OFFICE']
  if (!valid.includes(entityType)) return res.status(400).json({ error: 'Invalid entityType' })
  if (!companyName) return res.status(400).json({ error: 'companyName required' })
  const tier: Tier = packageTier === 'premium' ? 'premium' : 'standard'

  const formation = await Formation.create({
    userId: req.userId,
    entityType,
    companyName,
    packageTier: tier,
    priceCents: priceFor(entityType, tier),
    statusHistory: [{ status: 'draft', at: new Date() }],
  })
  res.status(201).json(formation)
})

formationsRouter.get('/', async (req, res) => {
  const list = await Formation.find({ userId: req.userId }).sort({ createdAt: -1 })
  res.json(list)
})

formationsRouter.get('/:id', async (req, res) => {
  const f = await Formation.findOne({ _id: req.params.id, userId: req.userId })
  if (!f) return res.status(404).json({ error: 'Not found' })
  res.json(f)
})

formationsRouter.post('/:id/submit', async (req, res) => {
  const f = await Formation.findOne({ _id: req.params.id, userId: req.userId })
  if (!f) return res.status(404).json({ error: 'Not found' })
  if (f.status !== 'draft') return res.status(400).json({ error: 'Not in draft' })
  pushStatus(f, 'documents_submitted')
  await f.save()
  res.json(f)
})

formationsRouter.use('/:id/documents', documentsRouter)
