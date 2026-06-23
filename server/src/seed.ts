import 'dotenv/config'
import { connectDb, disconnectDb } from './lib/db.js'
import { User } from './models/User.js'
import { Formation } from './models/Formation.js'
import { hashPassword } from './lib/auth.js'
import { priceFor } from './lib/pricing.js'

export async function seedDemo(): Promise<void> {
  await User.deleteMany({})
  await Formation.deleteMany({})

  const admin = await User.create({
    email: 'admin@chad.demo',
    passwordHash: await hashPassword('Admin@123'),
    fullName: 'Demo Admin',
    country: 'Chad',
    role: 'admin',
    emailVerified: true,
  })
  const user = await User.create({
    email: 'user@chad.demo',
    passwordHash: await hashPassword('User@123'),
    fullName: 'Demo User',
    country: 'India',
    role: 'user',
    emailVerified: true,
  })

  const specs: Array<{ entityType: 'SARL' | 'SA' | 'BRANCH'; name: string; status: string }> = [
    { entityType: 'SARL', name: 'Sahel Trading SARL', status: 'registered' },
    { entityType: 'SA', name: "N'Djamena Holdings SA", status: 'in_review' },
    { entityType: 'BRANCH', name: 'Global Imports Branch', status: 'documents_submitted' },
    { entityType: 'SARL', name: 'Draft Co SARL', status: 'draft' },
  ]

  for (const s of specs) {
    await Formation.create({
      userId: user._id,
      entityType: s.entityType,
      companyName: s.name,
      packageTier: 'standard',
      priceCents: priceFor(s.entityType, 'standard'),
      status: s.status,
      paymentStatus: s.status === 'registered' || s.status === 'in_review' ? 'paid' : 'unpaid',
      statusHistory: [{ status: s.status, at: new Date() }],
    })
  }

  console.log('Seeded:', { admin: admin.email, user: user.email, formations: specs.length })
}

// Direct execution: `npm run seed`
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  connectDb(process.env.MONGODB_URI!)
    .then(seedDemo)
    .then(disconnectDb)
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}
