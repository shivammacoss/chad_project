import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const messageSchema = new Schema(
  { authorId: { type: Schema.Types.ObjectId, ref: 'User' }, authorRole: { type: String, default: '' }, body: { type: String, required: true }, at: { type: Date, default: () => new Date() } },
  { _id: false },
)

const ticketSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, enum: ['legal', 'payment', 'documents', 'technical', 'other'], default: 'other' },
  subject: { type: String, required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  messages: { type: [messageSchema], default: [] },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
})

export type ITicket = InferSchemaType<typeof ticketSchema>
export const Ticket = mongoose.model('Ticket', ticketSchema)
