import express, { type Express } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { formationsRouter } from './routes/formations.js'

export function createApp(): Express {
  const app = express()

  app.use(
    cors({
      origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
      credentials: true,
    }),
  )
  // Stripe webhook needs the raw body; it is mounted before express.json() in Task 8.
  app.use(express.json())
  app.use(cookieParser())

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/formations', formationsRouter)

  return app
}
