import { Router } from 'express'
import { listServices } from '../lib/serviceStore.js'
import { SERVICES } from '../lib/services.js'

export const servicesRouter = Router()
servicesRouter.get('/', async (req, res) => {
  const country = req.query.country ? String(req.query.country) : 'TD'
  try { res.json(await listServices(true, country)) } catch { res.json(SERVICES) }
})
