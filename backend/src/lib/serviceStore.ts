import { Service } from '../models/Service.js'
import { SERVICES, type ServiceDef } from './services.js'

function toDef(doc: { key: string; category: string; name: string; blurb: string; priceCents: number; flow: string; intakeFields: unknown[]; requiredDocuments: string[] }): ServiceDef {
  return {
    key: doc.key, category: doc.category, name: doc.name, blurb: doc.blurb,
    priceCents: doc.priceCents, flow: doc.flow as ServiceDef['flow'],
    intakeFields: doc.intakeFields as ServiceDef['intakeFields'], requiredDocuments: doc.requiredDocuments,
  }
}

export async function seedServicesIfEmpty(): Promise<void> {
  const count = await Service.countDocuments({})
  if (count === 0) await Service.insertMany(SERVICES.map((s) => ({ ...s, active: true })))
}

export async function listServices(activeOnly = true): Promise<ServiceDef[]> {
  await seedServicesIfEmpty()
  const docs = await Service.find(activeOnly ? { active: true } : {}).sort({ category: 1, name: 1 })
  return docs.map((d) => toDef(d as never))
}

export async function getServiceDef(key: string): Promise<ServiceDef | null> {
  await seedServicesIfEmpty()
  const doc = await Service.findOne({ key, active: true })
  return doc ? toDef(doc as never) : null
}
