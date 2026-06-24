import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { User } from '../models/User.js'
import { hashPassword } from '../lib/auth.js'
import { __setTransport } from '../lib/email.js'
import { notifyUser } from '../lib/notify.js'
import { Notification } from '../models/Notification.js'

const app = createApp()

beforeEach(() => { __setTransport({ sendMail: vi.fn(async () => ({})) }) })

async function authed() {
  const u = await User.create({ email: 'n@x.com', passwordHash: await hashPassword('secret123'), fullName: 'N', country: 'IN', emailVerified: true })
  const agent = request.agent(app)
  await agent.post('/api/auth/login').send({ email: 'n@x.com', password: 'secret123' })
  return { agent, userId: String(u._id) }
}

describe('notifications', () => {
  it('notifyUser creates a notification and does not throw on email failure', async () => {
    __setTransport({ sendMail: vi.fn(async () => { throw new Error('smtp down') }) })
    const u = await User.create({ email: 'z@x.com', passwordHash: 'x', fullName: 'Z', country: 'IN' })
    await expect(notifyUser(u._id, { type: 'info', title: 'Hi', body: 'there' })).resolves.toBeUndefined()
    expect(await Notification.countDocuments({ userId: u._id })).toBe(1)
  })

  it('lists, counts unread, and marks read', async () => {
    const { agent, userId } = await authed()
    await notifyUser(userId, { type: 'payment', title: 'Paid', body: 'ok', link: '/dashboard' })
    await notifyUser(userId, { type: 'status', title: 'Update', body: 'x' })
    const list = await agent.get('/api/notifications')
    expect(list.body.length).toBe(2)
    const count = await agent.get('/api/notifications/unread-count')
    expect(count.body.count).toBe(2)
    await agent.patch(`/api/notifications/${list.body[0]._id}/read`)
    const count2 = await agent.get('/api/notifications/unread-count')
    expect(count2.body.count).toBe(1)
    await agent.patch('/api/notifications/read-all')
    const count3 = await agent.get('/api/notifications/unread-count')
    expect(count3.body.count).toBe(0)
  })
})
