import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import NotificationBell from '../NotificationBell'

afterEach(() => vi.restoreAllMocks())

describe('NotificationBell', () => {
  it('shows the unread count and lists notifications on open', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('unread-count')) return new Response(JSON.stringify({ count: 2 }), { status: 200 })
      if (url.includes('/api/notifications')) return new Response(JSON.stringify([
        { _id: 'n1', type: 'payment', title: 'Payment received', body: 'ok', link: '/dashboard', read: false, createdAt: '' },
      ]), { status: 200 })
      return new Response('{}', { status: 200 })
    }))
    render(<MemoryRouter><NotificationBell /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument())
    await userEvent.click(screen.getByLabelText('Notifications'))
    await waitFor(() => expect(screen.getByText('Payment received')).toBeInTheDocument())
  })
})
