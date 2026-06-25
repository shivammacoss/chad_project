import { Service } from '../models/Service.js'
import { Country } from '../models/Country.js'
import { SERVICES, type ServiceDef } from './services.js'

function toDef(doc: { key: string; category: string; name: string; blurb: string; priceCents: number; flow: string; intakeFields: unknown[]; requiredDocuments: string[]; country?: string }): ServiceDef {
  return {
    key: doc.key, category: doc.category, name: doc.name, blurb: doc.blurb,
    priceCents: doc.priceCents, flow: doc.flow as ServiceDef['flow'],
    intakeFields: doc.intakeFields as ServiceDef['intakeFields'], requiredDocuments: doc.requiredDocuments,
    country: (doc as { country?: string }).country ?? 'TD',
  }
}

export async function seedCountriesIfEmpty(): Promise<void> {
  if ((await Country.countDocuments({})) === 0) {
    await Country.insertMany([
      { code: 'TD', name: 'Chad', flag: '🇹🇩', active: true },
      { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', active: true },
      { code: 'KE', name: 'Kenya', flag: '🇰🇪', active: true },
    ])
  }
}

export async function seedServicesIfEmpty(): Promise<void> {
  const count = await Service.countDocuments({})
  if (count === 0) await Service.insertMany(SERVICES.map((s) => ({ ...s, active: true, country: s.country ?? 'TD' })))
}

export async function listServices(activeOnly = true, country?: string): Promise<ServiceDef[]> {
  await seedServicesIfEmpty()
  const filter: Record<string, unknown> = activeOnly ? { active: true } : {}
  if (country && country !== 'all') filter.country = country
  const docs = await Service.find(filter).sort({ category: 1, name: 1 })
  return docs.map((d) => toDef(d as never))
}

export async function getServiceDef(key: string): Promise<ServiceDef | null> {
  await seedServicesIfEmpty()
  const doc = await Service.findOne({ key, active: true })
  return doc ? toDef(doc as never) : null
}
