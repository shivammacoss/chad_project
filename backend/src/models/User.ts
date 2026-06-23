import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['user', 'customer', 'sales', 'legal', 'compliance', 'government_agent', 'finance', 'support', 'admin'], default: 'customer' },
  emailVerified: { type: Boolean, default: false },
  emailVerifyToken: { type: String, default: null },
  emailVerifyExpires: { type: Date, default: null },
  createdAt: { type: Date, default: () => new Date() },
})

export type IUser = InferSchemaType<typeof userSchema>
export const User = mongoose.model('User', userSchema)
