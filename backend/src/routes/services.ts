import { Router } from 'express'
import { SERVICES } from '../lib/services.js'

export const servicesRouter = Router()

servicesRouter.get('/', (_req, res) => {
  res.json(SERVICES)
})
