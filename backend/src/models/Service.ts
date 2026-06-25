import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const serviceSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  category: { type: String, default: '' },
  name: { type: String, required: true },
  blurb: { type: String, default: '' },
  priceCents: { type: Number, required: true },
  flow: { type: String, enum: ['formation', 'generic'], default: 'generic' },
  intakeFields: { type: [Schema.Types.Mixed], default: [] },
  requiredDocuments: { type: [String], default: [] },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: () => new Date() },
})

export type IService = InferSchemaType<typeof serviceSchema>
export const Service = mongoose.model('Service', serviceSchema)
