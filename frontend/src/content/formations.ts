import type { EntityType, ApplicationStatus, OwnerRole, VoPlan } from '@/types/app'

export const ENTITY_TYPES: { value: EntityType; label: string; blurb: string }[] = [
  { value: 'SARL', label: 'SARL', blurb: 'Limited liability company — the standard for foreign investors.' },
  { value: 'SARL_U', label: 'SARL Unipersonnelle', blurb: 'Single-member limited liability company.' },
  { value: 'SA', label: 'SA', blurb: 'Public limited company for larger ventures.' },
  { value: 'BRANCH', label: 'Branch (Succursale)', blurb: 'A branch of an existing foreign company.' },
  { value: 'REP_OFFICE', label: 'Representative Office', blurb: 'Non-trading liaison presence in Chad.' },
]

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  documents_submitted: 'Documents submitted',
  payment_pending: 'Payment pending',
  paid: 'Paid',
  in_review: 'In review',
  filing_submitted: 'Filing submitted (ANIE)',
  registered: 'Registered',
  needs_more_docs: 'Needs more documents',
  rejected: 'Rejected',
}

export const ENTITY_PRICE_CENTS: Record<EntityType, number> = {
  SARL: 49900, SARL_U: 39900, SA: 99900, BRANCH: 79900, REP_OFFICE: 59900,
}

export const VO_PLANS: { value: VoPlan; label: string; priceCents: number; blurb: string }[] = [
  { value: 'basic', label: 'Basic registered office', priceCents: 20000, blurb: 'A compliant registered address in N\'Djamena with mail receipt.' },
  { value: 'premium', label: 'Premium office', priceCents: 50000, blurb: 'Registered address plus mail forwarding and call handling.' },
]

export const OWNER_ROLES: { value: OwnerRole; label: string }[] = [
  { value: 'director', label: 'Director' },
  { value: 'shareholder', label: 'Shareholder' },
  { value: 'both', label: 'Director & Shareholder' },
]

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}
