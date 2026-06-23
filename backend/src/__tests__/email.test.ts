import { describe, it, expect, vi } from 'vitest'
import { sendVerificationEmail, __setTransport } from '../lib/email.js'

describe('email', () => {
  it('sends a verification email through the transport', async () => {
    const sendMail = vi.fn().mockResolvedValue({})
    __setTransport({ sendMail })
    await sendVerificationEmail('u@x.com', 'http://link/verify?token=abc')
    expect(sendMail).toHaveBeenCalledOnce()
    const arg = sendMail.mock.calls[0][0]
    expect(arg.to).toBe('u@x.com')
    expect(arg.html).toContain('http://link/verify?token=abc')
  })
})
