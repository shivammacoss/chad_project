import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const documentSchema = new Schema({
  applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String, default: '' },
  type: { type: String, enum: ['passport', 'address_proof', 'photo', 'other'], required: true },
  fileName: { type: String, required: true },
  storagePath: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: () => new Date() },
})

export type IDocument = InferSchemaType<typeof documentSchema>
export const DocumentModel = mongoose.model('Document', documentSchema)
