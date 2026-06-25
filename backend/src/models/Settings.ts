import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const settingsSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: Schema.Types.Mixed, default: {} },
})

export type ISettings = InferSchemaType<typeof settingsSchema>
export const Settings = mongoose.model('Settings', settingsSchema)
