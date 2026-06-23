import { Router, raw } from 'express'
import { Formation } from '../models/Formation.js'
import { getStripe } from '../lib/stripe.js'
import { requireAuth } from '../middleware/auth.js'
import { pushStatus } from './formations.js'

// Checkout creation — mounted under /api/formations/:id/checkout
export const checkoutRouter = Router({ mergeParams: true })
checkoutRouter.use(requireAuth)

checkoutRouter.post('/', async (req, res) => {
  const f = await Formation.findOne({ _id: req.params.id, userId: req.userId })
  if (!f) return res.status(404).json({ error: 'Not found' })

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `${f.entityType} formation — ${f.companyName}` },
          unit_amount: f.priceCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/dashboard?paid=1`,
    cancel_url: `${process.env.CLIENT_URL}/dashboard?canceled=1`,
  })

  f.stripeSessionId = session.id
  pushStatus(f, 'payment_pending')
  await f.save()
  res.json({ url: session.url })
})

// Webhook — mounted at /api/webhooks/stripe with a raw body parser.
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
    const f = await Formation.findOne({ stripeSessionId: session.id })
    if (f) {
      f.paymentStatus = 'paid'
      pushStatus(f, 'paid')
      await f.save()
    }
  }
  res.json({ received: true })
})
