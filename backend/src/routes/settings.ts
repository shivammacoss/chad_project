import { Router } from 'express'
import { getPaymentSettings } from '../lib/settings.js'

export const settingsRouter = Router()

settingsRouter.get('/payment', async (_req, res) => {
  res.json(await getPaymentSettings())
})
