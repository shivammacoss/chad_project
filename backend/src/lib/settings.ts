import { Settings } from '../models/Settings.js'

export interface PaymentSettings {
  stripe: boolean
  bank_transfer: boolean
  flutterwave: boolean
}

const DEFAULT_PAYMENT: PaymentSettings = { stripe: true, bank_transfer: true, flutterwave: false }

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const doc = await Settings.findOne({ key: 'payment' })
  if (!doc) {
    await Settings.create({ key: 'payment', value: DEFAULT_PAYMENT })
    return DEFAULT_PAYMENT
  }
  return { ...DEFAULT_PAYMENT, ...(doc.value as Partial<PaymentSettings>) }
}

export async function setPaymentSettings(patch: Partial<PaymentSettings>): Promise<PaymentSettings> {
  const current = await getPaymentSettings()
  const next = { ...current, ...patch }
  await Settings.findOneAndUpdate({ key: 'payment' }, { value: next }, { upsert: true })
  return next
}
