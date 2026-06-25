import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const auditSchema = new Schema({
  actorId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  actorRole: { type: String, default: '' },
  action: { type: String, required: true },
  target: { type: String, default: '' },
  meta: { type: Schema.Types.Mixed, default: {} },
  ip: { type: String, default: '' },
  at: { type: Date, default: () => new Date() },
})

export type IAuditLog = InferSchemaType<typeof auditSchema>
export const AuditLog = mongoose.model('AuditLog', auditSchema)
