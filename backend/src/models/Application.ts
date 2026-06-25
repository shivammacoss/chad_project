import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const ownerSchema = new Schema(
  {
    fullName: { type: String, required: true },
    role: { type: String, enum: ['director', 'shareholder', 'both'], required: true },
    nationality: { type: String, required: true },
    ownershipPercent: { type: Number, default: 0, min: 0, max: 100 },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    passportNo: { type: String },
    idNumber: { type: String },
    dob: { type: String },
    isCorporate: { type: Boolean, default: false },
    isPrimaryContact: { type: Boolean, default: false },
  },
  { _id: false },
)

const statusEntry = new Schema(
  { status: { type: String, required: true }, note: { type: String }, at: { type: Date, default: () => new Date() } },
  { _id: false },
)

const applicationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assignedAgentId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  serviceKey: { type: String, required: true, default: 'company-formation' },
  serviceName: { type: String, default: 'Company Formation' },
  entityType: { type: String, enum: ['SARL', 'SARL_U', 'SA', 'BRANCH', 'REP_OFFICE'] },
  packageTier: { type: String, enum: ['standard', 'premium'], default: 'standard' },
  companyDetails: {
    proposedName: { type: String },
    alternateName: { type: String },
    alternateName2: { type: String },
    businessActivity: { type: String },
    shareCapitalFCFA: { type: Number },
    paidUpCapitalFCFA: { type: Number },
    currency: { type: String, default: 'FCFA' },
    city: { type: String, default: "N'Djamena" },
  },
  owners: { type: [ownerSchema], default: [] },
  virtualOffice: {
    wanted: { type: Boolean, default: false },
    plan: { type: String, enum: ['basic', 'premium'] },
  },
  intake: { type: Schema.Types.Mixed, default: {} },
  priceCents: { type: Number, required: true },
  status: {
    type: String,
    enum: ['draft', 'documents_submitted', 'payment_pending', 'paid', 'in_review', 'filing_submitted', 'registered', 'needs_more_docs', 'rejected', 'legal_review', 'waiting_government', 'completed'],
    default: 'draft',
  },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  stripeSessionId: { type: String, default: null },
  paymentMethod: { type: String, enum: ['stripe', 'bank_transfer'], default: null },
  companyRegNo: { type: String, default: null },
  registeredAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
  remindersSent: { type: [Number], default: [] },
  renewsApplicationId: { type: Schema.Types.ObjectId, ref: 'Application', default: null },
  statusHistory: { type: [statusEntry], default: [] },
  currentStep: { type: Number, default: 1 },
  createdAt: { type: Date, default: () => new Date() },
})

export type IApplication = InferSchemaType<typeof applicationSchema>
export const Application = mongoose.model('Application', applicationSchema)
