import express, { type Express } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { applicationsRouter } from './routes/applications.js'
import { adminRouter } from './routes/admin.js'
import { staffRouter } from './routes/staff.js'
import { webhookRouter } from './routes/payments.js'
import { servicesRouter } from './routes/services.js'
import { countriesRouter } from './routes/countries.js'
import { notificationsRouter } from './routes/notifications.js'
import { invoicesRouter } from './routes/invoices.js'
import { ticketsRouter } from './routes/tickets.js'
import { settingsRouter } from './routes/settings.js'
import { isAllowedOrigin } from './lib/clientUrls.js'

export function createApp(): Express {
  const app = express()

  // Behind Railway/Vercel proxies — trust the first proxy so req.ip + secure cookies resolve correctly.
  app.set('trust proxy', 1)

  app.use(
    cors({
      // Allow same-origin/no-origin (curl, server-to-server) and any configured client URL
      // (trailing slashes are ignored). Set ALLOW_VERCEL_PREVIEWS=true to also allow *.vercel.app.
      origin(origin, cb) {
        if (!origin || isAllowedOrigin(origin)) return cb(null, true)
        cb(null, false)
      },
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
  app.use('/api/countries', countriesRouter)
  app.use('/api/settings', settingsRouter)

  app.use('/api/auth', authRouter)
  app.use('/api/applications', applicationsRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api/staff', staffRouter)
  app.use('/api/notifications', notificationsRouter)
  app.use('/api/invoices', invoicesRouter)
  app.use('/api/tickets', ticketsRouter)

  return app
}
