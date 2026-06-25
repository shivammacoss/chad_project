import nodemailer from 'nodemailer'

interface Transport {
  sendMail(opts: {
    from: string
    to: string
    subject: string
    html: string
  }): Promise<unknown>
}

let transport: Transport | null = null

export function __setTransport(t: Transport): void {
  transport = t
}

/**
 * Email is "on" when a transport has been injected (tests) or SMTP is explicitly
 * enabled via EMAIL_ENABLED=true. Otherwise email is OFF and all sends are no-ops.
 */
export function isEmailEnabled(): boolean {
  return transport !== null || process.env.EMAIL_ENABLED === 'true'
}

function getTransport(): Transport | null {
  if (transport) return transport
  if (process.env.EMAIL_ENABLED !== 'true') return null // SMTP off
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  return transport
}

export async function sendVerificationEmail(to: string, link: string): Promise<void> {
  const t = getTransport()
  if (!t) return // email off — no-op
  await t.sendMail({
    from: process.env.EMAIL_FROM ?? 'no-reply@example.com',
    to,
    subject: 'Verify your email — Chad Business Assist',
    html: `<p>Welcome! Confirm your email to activate your account:</p>
           <p><a href="${link}">Verify my email</a></p>
           <p>This link expires in 24 hours.</p>`,
  })
}

export async function sendNotificationEmail(to: string, title: string, body: string): Promise<void> {
  const t = getTransport()
  if (!t) return // email off — no-op
  await t.sendMail({
    from: process.env.EMAIL_FROM ?? 'no-reply@example.com',
    to,
    subject: `${title} — Chad Business Assist`,
    html: `<h2>${title}</h2><p>${body}</p><p style="color:#888">— Chad Business Assist</p>`,
  })
}
