export type EntityType = 'SARL' | 'SARL_U' | 'SA' | 'BRANCH' | 'REP_OFFICE'
export type ApplicationStatus =
  | 'draft' | 'documents_submitted' | 'payment_pending' | 'paid'
  | 'in_review' | 'filing_submitted' | 'registered' | 'needs_more_docs' | 'rejected'
export type DocType = 'passport' | 'address_proof' | 'photo' | 'other'
export type OwnerRole = 'director' | 'shareholder' | 'both'
export type VoPlan = 'basic' | 'premium'

export interface AuthUser { id: string; email: string; fullName: string; country?: string; role: 'user' | 'admin' }

export interface Owner {
  fullName: string; role: OwnerRole; nationality: string
  ownershipPercent: number; email?: string; isPrimaryContact: boolean
}
export interface CompanyDetails {
  proposedName: string; alternateName?: string; businessActivity?: string
  shareCapitalFCFA?: number; city: string
}
export interface VirtualOffice { wanted: boolean; plan?: VoPlan }

export interface Application {
  _id: string; entityType?: EntityType; packageTier: 'standard' | 'premium'
  companyDetails?: CompanyDetails; owners: Owner[]; virtualOffice: VirtualOffice
  serviceKey: string; serviceName: string; intake?: Record<string, unknown>
  priceCents: number; status: ApplicationStatus; paymentStatus: 'unpaid' | 'paid'
  statusHistory: { status: string; note?: string; at: string }[]
  currentStep: number; createdAt: string
  userId?: string | { _id: string; email: string; fullName: string }
}
export interface DocItem {
  _id: string; type: DocType; ownerName?: string; fileName: string
  status: 'pending' | 'approved' | 'rejected'; uploadedAt: string
}
