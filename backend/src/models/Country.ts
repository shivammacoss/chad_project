import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const countrySchema = new Schema({
  code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  flag: { type: String, default: '' },
  active: { type: Boolean, default: true },
})

export type ICountry = InferSchemaType<typeof countrySchema>
export const Country = mongoose.model('Country', countrySchema)
