import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { isEmailEnabled } from '../lib/email.js'

// This file does NOT inject a transport, and EMAIL_ENABLED is unset in tests,
// so email is OFF — the default "SMTP off" behavior.
const app = createApp()

describe('email off (default)', () => {
  it('reports email disabled when no transport + EMAIL_ENABLED unset', () => {
    expect(isEmailEnabled()).toBe(false)
  })

  it('auto-verifies signup and allows immediate login (no email needed)', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'off@x.com', password: 'secret123', fullName: 'Off', country: 'IN' })
    expect(res.status).toBe(201)
    expect(res.body.verified).toBe(true)

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'off@x.com', password: 'secret123' })
    expect(login.status).toBe(200) // not blocked — user is auto-verified
  })
})
