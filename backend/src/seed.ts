import 'dotenv/config'
import { connectDb, disconnectDb } from './lib/db.js'
import { User } from './models/User.js'
import { Application } from './models/Application.js'
import { DocumentModel } from './models/Document.js'
import { Notification } from './models/Notification.js'
import { Invoice } from './models/Invoice.js'
import { Ticket } from './models/Ticket.js'
import { AuditLog } from './models/AuditLog.js'
import { hashPassword } from './lib/auth.js'
import { totalPrice } from './lib/pricing.js'
import { upsertInvoice, markInvoicePaid } from './lib/invoice.js'
import { seedServicesIfEmpty, seedCountriesIfEmpty } from './lib/serviceStore.js'

export async function seedDemo(): Promise<void> {
  await User.deleteMany({})
  await Application.deleteMany({})
  await seedCountriesIfEmpty()
  await seedServicesIfEmpty()

  const admin = await User.create({
    email: 'admin@chad.demo', passwordHash: await hashPassword('Admin@123'),
    fullName: 'Demo Admin', country: 'Chad', role: 'admin', emailVerified: true,
  })
  const user = await User.create({
    email: 'user@chad.demo', passwordHash: await hashPassword('User@123'),
    fullName: 'Demo User', country: 'India', role: 'user', emailVerified: true, phone: '+91 90000 00000',
  })
  const legal = await User.create({ email: 'legal@chad.demo', passwordHash: await hashPassword('Legal@123'), fullName: 'Legal Officer', country: 'Chad', role: 'legal', emailVerified: true })
  const agent = await User.create({ email: 'agent@chad.demo', passwordHash: await hashPassword('Agent@123'), fullName: 'Gov Agent', country: 'Chad', role: 'government_agent', emailVerified: true })

  const specs = [
    {
      entityType: 'SARL' as const, name: 'Sahel Trading SARL', status: 'registered',
      owners: [
        { fullName: 'Amadou Diallo', role: 'both' as const, nationality: 'Chad', ownershipPercent: 60, isPrimaryContact: true, passportNo: 'TD1234567', phone: '+235 60 00 00 00', dob: '1985-04-12', address: 'Av. Charles de Gaulle, N\'Djamena' },
        { fullName: 'Rajesh Kumar', role: 'shareholder' as const, nationality: 'India', ownershipPercent: 40, isPrimaryContact: false, passportNo: 'IN9876543', email: 'rajesh@example.com' },
      ],
      vo: { wanted: true, plan: 'premium' as const },
    },
    {
      entityType: 'SA' as const, name: "N'Djamena Holdings SA", status: 'in_review',
      owners: [
        { fullName: 'Fatima Hassan', role: 'director' as const, nationality: 'Chad', ownershipPercent: 100, isPrimaryContact: true },
      ],
      vo: { wanted: true, plan: 'basic' as const },
    },
    {
      entityType: 'SARL' as const, name: 'Draft Co SARL', status: 'draft',
      owners: [], vo: { wanted: false as const },
    },
  ]

  const created = []
  for (const s of specs) {
    created.push(await Application.create({
      userId: user._id,
      serviceKey: 'company-formation',
      serviceName: 'Company Formation',
      entityType: s.entityType,
      packageTier: 'standard',
      companyDetails: { proposedName: s.name, businessActivity: 'General trading', shareCapitalFCFA: 1000000, paidUpCapitalFCFA: 500000, currency: 'FCFA', city: "N'Djamena" },
      owners: s.owners,
      virtualOffice: s.vo,
      priceCents: totalPrice(s.entityType, 'standard', s.vo),
      status: s.status,
      paymentStatus: s.status === 'registered' || s.status === 'in_review' ? 'paid' : 'unpaid',
      currentStep: s.status === 'draft' ? 2 : 7,
      statusHistory: [{ status: s.status, at: new Date() }],
    }))
  }

  await Application.create({
    userId: user._id,
    serviceKey: 'virtual-office',
    serviceName: 'Virtual Office',
    priceCents: 20000,
    intake: { package: 'Standard', companyName: 'Demo User' },
    status: 'in_review',
    paymentStatus: 'paid',
    currentStep: 3,
    statusHistory: [{ status: 'in_review', at: new Date() }],
  })

  const inReview = created.find((a) => a.status === 'in_review')
  if (inReview) { inReview.assignedAgentId = agent._id; await inReview.save() }
  const registered = created.find((a) => a.status === 'registered')
  if (inReview) {
    await DocumentModel.create({ applicationId: inReview._id, userId: user._id, ownerName: 'Amadou Diallo', type: 'passport', fileName: 'passport.pdf', storagePath: 'seed/passport.pdf', status: 'rejected', rejectionReason: 'Please upload a clearer passport scan.' })
  }
  if (registered) {
    await DocumentModel.create({ applicationId: registered._id, userId: user._id, ownerName: '', type: 'certificate', fileName: 'certificate-of-incorporation.pdf', storagePath: 'seed/certificate.pdf', status: 'approved' })
  }

  const regApp = created.find((a) => a.status === 'registered')
  if (regApp) {
    regApp.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    regApp.remindersSent = []
    await regApp.save()
  }
  await Notification.deleteMany({})
  await Notification.create({ userId: user._id, type: 'payment', title: 'Payment received', body: 'Your payment was received. Application in processing.', link: regApp ? `/applications/${regApp._id}` : '/dashboard', read: false })
  await Notification.create({ userId: user._id, type: 'certificate', title: 'Your company is registered!', body: 'Your Certificate of Incorporation is ready to download.', link: regApp ? `/applications/${regApp._id}` : '/dashboard', read: false })

  await Invoice.deleteMany({})
  const reg = created.find((a) => a.status === 'registered')
  const rev = created.find((a) => a.status === 'in_review')
  if (reg) { await upsertInvoice(reg as never, 'stripe'); await markInvoicePaid(reg._id) }
  if (rev) { await upsertInvoice(rev as never, 'bank_transfer') }

  await Ticket.deleteMany({})
  await AuditLog.deleteMany({})
  await Ticket.create({ userId: user._id, category: 'documents', subject: 'Passport upload issue', status: 'open', messages: [{ authorId: user._id, authorRole: 'customer', body: 'My passport upload keeps failing.', at: new Date() }] })
  await AuditLog.create({ actorId: admin._id, actorRole: 'admin', action: 'seed.init', target: 'system', meta: {}, ip: '127.0.0.1' })

  console.log('Seeded:', { admin: admin.email, user: user.email, legal: legal.email, agent: agent.email, applications: specs.length + 1 })
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
