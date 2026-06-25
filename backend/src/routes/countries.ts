import { Router } from 'express'
import { Country } from '../models/Country.js'
import { seedCountriesIfEmpty } from '../lib/serviceStore.js'

export const countriesRouter = Router()
countriesRouter.get('/', async (_req, res) => {
  await seedCountriesIfEmpty()
  res.json(await Country.find({ active: true }).sort({ name: 1 }))
})
