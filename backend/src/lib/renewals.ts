import { Application } from '../models/Application.js'
import { notifyUser } from './notify.js'

const THRESHOLDS = [1, 7, 30, 60, 90] // ascending; bucket = smallest threshold >= days

export async function runRenewalReminders(now: Date = new Date()): Promise<{ sent: number }> {
  const apps = await Application.find({ status: 'registered', expiresAt: { $ne: null } })
  let sent = 0
  for (const app of apps) {
    if (!app.expiresAt) continue
    const days = Math.ceil((new Date(app.expiresAt).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    if (days < 0) continue
    const bucket = THRESHOLDS.find((t) => days <= t)
    if (bucket === undefined) continue // more than 90 days out
    if (app.remindersSent.includes(bucket)) continue
    await notifyUser(app.userId, {
      type: 'status', title: 'Renewal due',
      body: `${app.companyDetails?.proposedName ?? 'Your company'} expires in ${days} day(s) — renew now.`,
      link: `/applications/${app._id}`,
    })
    app.remindersSent.push(bucket)
    await app.save()
    sent++
  }
  return { sent }
}
