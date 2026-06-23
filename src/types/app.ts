export type EntityType = 'SARL' | 'SARL_U' | 'SA' | 'BRANCH' | 'REP_OFFICE'
export type FormationStatus =
  | 'draft' | 'documents_submitted' | 'payment_pending' | 'paid'
  | 'in_review' | 'filing_submitted' | 'registered' | 'needs_more_docs' | 'rejected'
export type DocType = 'passport' | 'address_proof' | 'photo' | 'other'
export interface AuthUser { id: string; email: string; fullName: string; country?: string; role: 'user' | 'admin' }
export interface Formation {
  _id: string; entityType: EntityType; companyName: string
  packageTier: 'standard' | 'premium'; priceCents: number
  status: FormationStatus; paymentStatus: 'unpaid' | 'paid'
  statusHistory: { status: string; note?: string; at: string }[]; createdAt: string
  userId?: string | { _id: string; email: string; fullName: string }
}
export interface DocItem {
  _id: string; type: DocType; fileName: string
  status: 'pending' | 'approved' | 'rejected'; uploadedAt: string
}
