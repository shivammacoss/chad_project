import express, { type Express } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { applicationsRouter } from './routes/applications.js'
import { adminRouter } from './routes/admin.js'
import { staffRouter } from './routes/staff.js'
import { webhookRouter } from './routes/payments.js'
import { servicesRouter } from './routes/services.js'
import { notificationsRouter } from './routes/notifications.js'

export function createApp(): Express {
  const app = express()

  app.use(
    cors({
      origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
      credentials: true,
    }),
  )
  // Stripe webhook needs the raw body; it is mounted before express.json() in Task 8.
  app.use('/api/webhooks/stripe', webhookRouter)
  app.use(express.json())
  app.use(cookieParser())

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/api/services', servicesRouter)

  app.use('/api/auth', authRouter)
  app.use('/api/applications', applicationsRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api/staff', staffRouter)
  app.use('/api/notifications', notificationsRouter)

  return app
}
