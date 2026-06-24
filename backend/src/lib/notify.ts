import { Notification } from '../models/Notification.js'
import { User } from '../models/User.js'
import { sendNotificationEmail } from './email.js'

export async function notifyUser(
  userId: unknown,
  opts: { type: 'payment' | 'document' | 'status' | 'certificate' | 'info'; title: string; body: string; link?: string },
): Promise<void> {
  await Notification.create({
    userId,
    type: opts.type,
    title: opts.title,
    body: opts.body,
    link: opts.link ?? '',
  })
  try {
    const user = await User.findById(userId).select('email')
    if (user?.email) await sendNotificationEmail(user.email, opts.title, opts.body)
  } catch (err) {
    console.warn('notifyUser: email send failed (ignored):', (err as Error).message)
  }
}
