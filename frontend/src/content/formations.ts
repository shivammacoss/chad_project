import type { EntityType, FormationStatus } from '@/types/app'

export const ENTITY_TYPES: { value: EntityType; label: string; blurb: string }[] = [
  { value: 'SARL', label: 'SARL', blurb: 'Limited liability company — the standard for foreign investors.' },
  { value: 'SARL_U', label: 'SARL Unipersonnelle', blurb: 'Single-member limited liability company.' },
  { value: 'SA', label: 'SA', blurb: 'Public limited company for larger ventures.' },
  { value: 'BRANCH', label: 'Branch (Succursale)', blurb: 'A branch of an existing foreign company.' },
  { value: 'REP_OFFICE', label: 'Representative Office', blurb: 'Non-trading liaison presence in Chad.' },
]

export const STATUS_LABEL: Record<FormationStatus, string> = {
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

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}
