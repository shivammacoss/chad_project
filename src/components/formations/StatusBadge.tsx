import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { STATUS_LABEL } from '@/content/formations'
import type { FormationStatus } from '@/types/app'

const TONE: Record<FormationStatus, BadgeTone> = {
  draft: 'neutral',
  documents_submitted: 'neutral',
  payment_pending: 'warning',
  paid: 'neutral',
  in_review: 'neutral',
  filing_submitted: 'neutral',
  registered: 'live',
  needs_more_docs: 'warning',
  rejected: 'warning',
}

export function StatusBadge({ status }: { status: FormationStatus }) {
  return <Badge tone={TONE[status]} withDot={status === 'registered'}>{STATUS_LABEL[status]}</Badge>
}
