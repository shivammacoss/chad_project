import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const invoiceSchema = new Schema({
  invoiceNo: { type: String, required: true },
  applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  serviceName: { type: String, default: '' },
  amountCents: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  method: { type: String, enum: ['stripe', 'bank_transfer'], default: 'stripe' },
  status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  issuedAt: { type: Date, default: () => new Date() },
  paidAt: { type: Date, default: null },
})

export type IInvoice = InferSchemaType<typeof invoiceSchema>
export const Invoice = mongoose.model('Invoice', invoiceSchema)
