import { Router, raw } from 'express'
import { Application } from '../models/Application.js'
import { getStripe } from '../lib/stripe.js'
import { requireAuth } from '../middleware/auth.js'
import { pushStatus } from './applications.js'

export const checkoutRouter = Router({ mergeParams: true })
checkoutRouter.use(requireAuth)

checkoutRouter.post('/', async (req, res) => {
  const id = (req.params as { id: string }).id
  const app = await Application.findOne({ _id: id, userId: req.userId })
  if (!app) return res.status(404).json({ error: 'Not found' })
  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `${app.entityType} formation — ${app.companyDetails.proposedName}` },
          unit_amount: app.priceCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${clientUrl}/dashboard?paid=1`,
    cancel_url: `${clientUrl}/dashboard?canceled=1`,
  })
  if (!session.url) return res.status(502).json({ error: 'No checkout URL returned by Stripe' })
  app.stripeSessionId = session.id
  pushStatus(app, 'payment_pending')
  await app.save()
  res.json({ url: session.url })
})

export const webhookRouter = Router()
webhookRouter.post('/', raw({ type: 'application/json' }), async (req, res) => {
  let event
  try {
    event = getStripe().webhooks.constructEvent(
      req.body as Buffer,
      req.headers['stripe-signature'] as string,
      process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_dummy',
    )
  } catch {
    return res.status(400).json({ error: 'Bad signature' })
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { id: string }
    const app = await Application.findOne({ stripeSessionId: session.id })
    if (app) {
      app.paymentStatus = 'paid'
      pushStatus(app, 'paid')
      await app.save()
    }
  }
  res.json({ received: true })
})
