import { Router } from 'express'
import type { HydratedDocument } from 'mongoose'
import { Application, type IApplication } from '../models/Application.js'
import { totalPrice, type EntityType, type Tier, type VoPlan } from '../lib/pricing.js'
import { requireAuth } from '../middleware/auth.js'
import { documentsRouter } from './documents.js'
import { checkoutRouter } from './payments.js'

const ENTITIES: EntityType[] = ['SARL', 'SARL_U', 'SA', 'BRANCH', 'REP_OFFICE']

export function pushStatus(app: HydratedDocument<IApplication>, status: string, note?: string): void {
  app.status = status as IApplication['status']
  app.statusHistory.push({ status, note, at: new Date() })
}

function recompute(app: HydratedDocument<IApplication>): void {
  app.priceCents = totalPrice(
    app.entityType as EntityType,
    app.packageTier as Tier,
    { wanted: app.virtualOffice?.wanted ?? false, plan: app.virtualOffice?.plan as VoPlan | undefined },
  )
}

export const applicationsRouter = Router()
applicationsRouter.use(requireAuth)

applicationsRouter.post('/', async (req, res) => {
  const { entityType, packageTier } = req.body ?? {}
  if (!ENTITIES.includes(entityType)) return res.status(400).json({ error: 'Invalid entityType' })
  const tier: Tier = packageTier === 'premium' ? 'premium' : 'standard'
  const app = await Application.create({
    userId: req.userId,
    entityType,
    packageTier: tier,
    companyDetails: { proposedName: 'Untitled' },
    priceCents: totalPrice(entityType, tier, { wanted: false }),
    statusHistory: [{ status: 'draft', at: new Date() }],
  })
  res.status(201).json(app)
})

applicationsRouter.patch('/:id', async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, userId: req.userId })
  if (!app) return res.status(404).json({ error: 'Not found' })
  const { companyDetails, owners, virtualOffice, currentStep } = req.body ?? {}
  if (companyDetails) app.companyDetails = { ...app.companyDetails, ...companyDetails }
  if (Array.isArray(owners)) app.owners = owners
  if (virtualOffice) app.virtualOffice = virtualOffice
  if (typeof currentStep === 'number') app.currentStep = currentStep
  recompute(app)
  await app.save()
  res.json(app)
})

applicationsRouter.get('/', async (req, res) => {
  const list = await Application.find({ userId: req.userId }).sort({ createdAt: -1 })
  res.json(list)
})

applicationsRouter.get('/:id', async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, userId: req.userId })
  if (!app) return res.status(404).json({ error: 'Not found' })
  res.json(app)
})

applicationsRouter.post('/:id/submit', async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, userId: req.userId })
  if (!app) return res.status(404).json({ error: 'Not found' })
  if (app.status !== 'draft') return res.status(400).json({ error: 'Not in draft' })
  pushStatus(app, 'documents_submitted')
  await app.save()
  res.json(app)
})

applicationsRouter.use('/:id/checkout', checkoutRouter)
applicationsRouter.use('/:id/documents', documentsRouter)
