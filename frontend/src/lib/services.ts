import { apiGet } from '@/lib/api'

export interface ServiceField { name: string; label: string; type: 'text' | 'number' | 'select' | 'textarea'; options?: string[]; required?: boolean }
export interface ServiceDef {
  key: string; category: string; name: string; blurb: string
  priceCents: number; flow: 'formation' | 'generic'
  intakeFields: ServiceField[]; requiredDocuments: string[]
}

export const SERVICE_FALLBACK: ServiceDef[] = [
  { key: 'company-formation', category: 'Company Formation', name: 'Company Formation', blurb: 'Register a company in Chad.', priceCents: 49900, flow: 'formation', intakeFields: [], requiredDocuments: ['passport'] },
  { key: 'virtual-office', category: 'Office Solutions', name: 'Virtual Office', blurb: 'A registered address with mail handling.', priceCents: 20000, flow: 'generic', intakeFields: [{ name: 'package', label: 'Package', type: 'select', options: ['Basic', 'Standard', 'Premium'], required: true }], requiredDocuments: ['passport'] },
]

export function fetchServices(): Promise<ServiceDef[]> {
  return apiGet<ServiceDef[]>('/api/services').catch(() => SERVICE_FALLBACK)
}
