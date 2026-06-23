import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const ownerSchema = new Schema(
  {
    fullName: { type: String, required: true },
    role: { type: String, enum: ['director', 'shareholder', 'both'], required: true },
    nationality: { type: String, required: true },
    ownershipPercent: { type: Number, required: true, min: 0, max: 100 },
    email: { type: String },
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
  serviceKey: { type: String, required: true, default: 'company-formation' },
  serviceName: { type: String, default: 'Company Formation' },
  entityType: { type: String, enum: ['SARL', 'SARL_U', 'SA', 'BRANCH', 'REP_OFFICE'] },
  packageTier: { type: String, enum: ['standard', 'premium'], default: 'standard' },
  companyDetails: {
    proposedName: { type: String },
    alternateName: { type: String },
    businessActivity: { type: String },
    shareCapitalFCFA: { type: Number },
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
    enum: ['draft', 'documents_submitted', 'payment_pending', 'paid', 'in_review', 'filing_submitted', 'registered', 'needs_more_docs', 'rejected'],
    default: 'draft',
  },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  stripeSessionId: { type: String, default: null },
  statusHistory: { type: [statusEntry], default: [] },
  currentStep: { type: Number, default: 1 },
  createdAt: { type: Date, default: () => new Date() },
})

export type IApplication = InferSchemaType<typeof applicationSchema>
export const Application = mongoose.model('Application', applicationSchema)
