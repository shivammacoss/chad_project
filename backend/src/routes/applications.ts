import { Router } from 'express'
import type { HydratedDocument } from 'mongoose'
import { Application, type IApplication } from '../models/Application.js'
import { totalPrice, type EntityType, type Tier, type VoPlan } from '../lib/pricing.js'
import { getService, priceForOrder } from '../lib/services.js'
import { requireAuth } from '../middleware/auth.js'
import { User } from '../models/User.js'
import { generateCertificatePdf } from '../lib/certificate.js'
import { notifyUser } from '../lib/notify.js'
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
  const { serviceKey = 'company-formation', entityType, packageTier } = req.body ?? {}
  const service = getService(serviceKey)
  if (!service) return res.status(400).json({ error: 'Unknown service' })

  if (service.flow === 'formation') {
    if (!ENTITIES.includes(entityType)) return res.status(400).json({ error: 'Invalid entityType' })
    const tier: Tier = packageTier === 'premium' ? 'premium' : 'standard'
    const app = await Application.create({
      userId: req.userId,
      serviceKey,
      serviceName: service.name,
      entityType,
      packageTier: tier,
      companyDetails: { proposedName: 'Untitled' },
      priceCents: totalPrice(entityType, tier, { wanted: false }),
      statusHistory: [{ status: 'draft', at: new Date() }],
    })
    return res.status(201).json(app)
  }

  // generic service
  const app = await Application.create({
    userId: req.userId,
    serviceKey,
    serviceName: service.name,
    priceCents: priceForOrder(serviceKey),
    intake: {},
    statusHistory: [{ status: 'draft', at: new Date() }],
  })
  res.status(201).json(app)
})

applicationsRouter.patch('/:id', async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, userId: req.userId })
  if (!app) return res.status(404).json({ error: 'Not found' })
  const { companyDetails, owners, virtualOffice, currentStep, intake } = req.body ?? {}
  if (companyDetails) app.companyDetails = { ...app.companyDetails, ...companyDetails }
  if (Array.isArray(owners)) app.owners = owners as typeof app.owners
  if (virtualOffice) app.virtualOffice = virtualOffice
  if (typeof currentStep === 'number') app.currentStep = currentStep
  if (intake && typeof intake === 'object') app.intake = { ...(app.intake ?? {}), ...intake }
  if (app.serviceKey === 'company-formation' || app.entityType) recompute(app)
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
  await notifyUser(app.userId, { type: 'status', title: 'Application received', body: `We received your ${app.serviceName} application and will review your documents.`, link: `/applications/${app._id}` })
  res.json(app)
})

applicationsRouter.get('/:id/certificate.pdf', async (req, res) => {
  const app = await Application.findById(req.params.id)
  if (!app) return res.status(404).json({ error: 'Not found' })
  const isOwner = String(app.userId) === req.userId
  const isStaff = req.userRole && !['customer', 'user'].includes(req.userRole)
  if (!isOwner && !isStaff) return res.status(404).json({ error: 'Not found' })
  if (!app.companyRegNo) return res.status(404).json({ error: 'Certificate not issued yet' })
  const user = await User.findById(app.userId).select('fullName')
  const pdf = await generateCertificatePdf(app as never, user?.fullName ?? 'Applicant')
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'inline; filename="certificate-of-incorporation.pdf"')
  res.send(pdf)
})

applicationsRouter.use('/:id/checkout', checkoutRouter)
applicationsRouter.use('/:id/documents', documentsRouter)
