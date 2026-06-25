export type EntityType = 'SARL' | 'SARL_U' | 'SA' | 'BRANCH' | 'REP_OFFICE'
export type ApplicationStatus =
  | 'draft' | 'documents_submitted' | 'payment_pending' | 'paid'
  | 'in_review' | 'filing_submitted' | 'registered' | 'needs_more_docs' | 'rejected'
  | 'legal_review' | 'waiting_government' | 'completed'
export type DocType = 'passport' | 'address_proof' | 'photo' | 'other' | 'certificate' | 'government_receipt' | 'license'
export type OwnerRole = 'director' | 'shareholder' | 'both'
export type VoPlan = 'basic' | 'premium'

export interface AuthUser { id: string; email: string; fullName: string; country?: string; role: 'user' | 'customer' | 'sales' | 'legal' | 'compliance' | 'government_agent' | 'finance' | 'support' | 'admin' }

export interface Owner {
  fullName: string; role: OwnerRole; nationality: string
  ownershipPercent?: number; email?: string; phone?: string; address?: string
  passportNo?: string; idNumber?: string; dob?: string; isCorporate?: boolean
  isPrimaryContact: boolean
}
export interface CompanyDetails {
  proposedName: string; alternateName?: string; alternateName2?: string
  businessActivity?: string; shareCapitalFCFA?: number; paidUpCapitalFCFA?: number
  currency?: string; city: string
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
  assignedAgentId?: string | { _id: string; fullName: string; email: string } | null
  companyRegNo?: string | null
  registeredAt?: string | null
  paymentMethod?: 'stripe' | 'bank_transfer' | null
  expiresAt?: string | null
  remindersSent?: number[]
  renewsApplicationId?: string | null
}
export interface Invoice { _id: string; invoiceNo: string; serviceName: string; amountCents: number; currency: string; method: string; status: string; issuedAt: string }
export interface DocItem {
  _id: string; type: DocType; ownerName?: string; fileName: string
  status: 'pending' | 'approved' | 'rejected'; uploadedAt: string
  rejectionReason?: string
}

export interface Notification {
  _id: string; type: string; title: string; body: string; link: string; read: boolean; createdAt: string
}

export interface TicketMessage { authorRole: string; body: string; at: string }
export interface Ticket { _id: string; category: string; subject: string; status: string; messages: TicketMessage[]; updatedAt: string }

export interface AuditEntry { _id: string; actorRole: string; action: string; target: string; ip: string; at: string; actorId?: { email?: string } | string | null }

export interface AdminService { _id: string; key: string; category: string; name: string; priceCents: number; flow: string; active: boolean }
