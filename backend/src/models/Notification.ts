import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['payment', 'document', 'status', 'certificate', 'info'], default: 'info' },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  link: { type: String, default: '' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() },
})

export type INotification = InferSchemaType<typeof notificationSchema>
export const Notification = mongoose.model('Notification', notificationSchema)
