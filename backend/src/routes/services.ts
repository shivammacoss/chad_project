import { Router } from 'express'
import { listServices } from '../lib/serviceStore.js'
import { SERVICES } from '../lib/services.js'

export const servicesRouter = Router()
servicesRouter.get('/', async (_req, res) => {
  try { res.json(await listServices(true)) } catch { res.json(SERVICES) }
})
