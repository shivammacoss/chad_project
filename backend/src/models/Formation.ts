import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const statusEntry = new Schema(
  {
    status: { type: String, required: true },
    note: { type: String },
    at: { type: Date, default: () => new Date() },
  },
  { _id: false },
)

const formationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  entityType: {
    type: String,
    enum: ['SARL', 'SARL_U', 'SA', 'BRANCH', 'REP_OFFICE'],
    required: true,
  },
  companyName: { type: String, required: true },
  packageTier: { type: String, enum: ['standard', 'premium'], default: 'standard' },
  priceCents: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      'draft',
      'documents_submitted',
      'payment_pending',
      'paid',
      'in_review',
      'filing_submitted',
      'registered',
      'needs_more_docs',
      'rejected',
    ],
    default: 'draft',
  },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  stripeSessionId: { type: String, default: null },
  statusHistory: { type: [statusEntry], default: [] },
  createdAt: { type: Date, default: () => new Date() },
})

export type IFormation = InferSchemaType<typeof formationSchema>
export const Formation = mongoose.model('Formation', formationSchema)
