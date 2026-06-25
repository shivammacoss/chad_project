export interface ServiceField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea'
  options?: string[]
  required?: boolean
}

export interface ServiceDef {
  key: string
  category: string
  name: string
  blurb: string
  priceCents: number
  flow: 'formation' | 'generic'
  intakeFields: ServiceField[]
  requiredDocuments: string[]
  country?: string
}

export const SERVICES: ServiceDef[] = [
  {
    key: 'company-formation',
    category: 'Company Formation',
    name: 'Company Formation',
    blurb: 'Register an LLC/SARL, SA, Branch, Rep Office, NGO or Partnership in Chad.',
    priceCents: 49900,
    flow: 'formation',
    intakeFields: [],
    requiredDocuments: ['passport', 'address_proof', 'photo'],
  },
  {
    key: 'virtual-office',
    category: 'Office Solutions',
    name: 'Virtual Office',
    blurb: "A registered business address with mail handling in N'Djamena.",
    priceCents: 20000,
    flow: 'generic',
    intakeFields: [
      { name: 'package', label: 'Package', type: 'select', options: ['Basic', 'Standard', 'Premium'], required: true },
      { name: 'companyName', label: 'Company / your name', type: 'text', required: true },
    ],
    requiredDocuments: ['passport', 'address_proof'],
  },
  {
    key: 'business-license',
    category: 'Corporate Services',
    name: 'Business License',
    blurb: 'Apply for or renew a Chad business operating license.',
    priceCents: 35000,
    flow: 'generic',
    intakeFields: [
      { name: 'companyName', label: 'Company name', type: 'text', required: true },
      {
        name: 'activity',
        label: 'Business activity',
        type: 'select',
        options: ['Trading', 'IT', 'Consulting', 'Import/Export', 'Manufacturing', 'Construction'],
        required: true,
      },
    ],
    requiredDocuments: ['passport', 'address_proof'],
  },
  {
    key: 'accounting',
    category: 'Tax & Accounting',
    name: 'Accounting & Bookkeeping',
    blurb: 'Monthly bookkeeping and financial statements.',
    priceCents: 30000,
    flow: 'generic',
    intakeFields: [
      { name: 'companyName', label: 'Company name', type: 'text', required: true },
      {
        name: 'turnoverBand',
        label: 'Monthly turnover',
        type: 'select',
        options: ['< $5k', '$5k–$25k', '$25k–$100k', '> $100k'],
        required: true,
      },
    ],
    requiredDocuments: ['passport'],
  },
  {
    key: 'tax-registration',
    category: 'Tax & Accounting',
    name: 'Tax Registration',
    blurb: 'Register for a Tax ID (NIF) and/or VAT in Chad.',
    priceCents: 25000,
    flow: 'generic',
    intakeFields: [
      { name: 'companyName', label: 'Company name', type: 'text', required: true },
      { name: 'taxType', label: 'Registration type', type: 'select', options: ['Tax ID (NIF)', 'VAT', 'Both'], required: true },
    ],
    requiredDocuments: ['passport'],
  },
  {
    key: 'trademark',
    category: 'Corporate Services',
    name: 'Trademark Registration',
    blurb: 'Protect your brand with a registered trademark.',
    priceCents: 40000,
    flow: 'generic',
    intakeFields: [
      { name: 'markName', label: 'Trademark / brand name', type: 'text', required: true },
      { name: 'class', label: 'Goods/services description', type: 'textarea', required: true },
    ],
    requiredDocuments: ['passport'],
  },
  {
    key: 'annual-renewal',
    category: 'Compliance',
    name: 'Annual Renewal & Filing',
    blurb: 'Renew your company registration and file annual returns.',
    priceCents: 25000,
    flow: 'generic',
    intakeFields: [{ name: 'renewingCompany', label: 'Company being renewed', type: 'text', required: true }],
    requiredDocuments: ['other'],
  },
  {
    key: 'license-renewal',
    category: 'Compliance',
    name: 'Business License Renewal',
    blurb: 'Renew your Chad business operating license.',
    priceCents: 20000,
    flow: 'generic',
    intakeFields: [{ name: 'companyName', label: 'Company name', type: 'text', required: true }],
    requiredDocuments: ['other'],
  },
]

export function getService(key: string): ServiceDef | undefined {
  return SERVICES.find((s) => s.key === key)
}

// Base price for an order's service. Formation pricing (entity/tier/VO) is computed
// separately in the applications route; this returns the registry base.
export function priceForOrder(key: string): number {
  return getService(key)?.priceCents ?? 0
}
