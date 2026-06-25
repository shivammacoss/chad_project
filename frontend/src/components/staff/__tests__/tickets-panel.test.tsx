import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TicketsPanel from '../TicketsPanel'

afterEach(() => vi.restoreAllMocks())

describe('TicketsPanel', () => {
  it('lists tickets and opens a thread', async () => {
    const T = { _id: 't1', category: 'documents', subject: 'Help', status: 'open', messages: [{ authorRole: 'customer', body: 'issue', at: '' }], updatedAt: '' }
    vi.stubGlobal('fetch', vi.fn(async (_url: string) => {
      if (_url.includes('/api/staff/tickets/t1')) return new Response(JSON.stringify(T), { status: 200 })
      return new Response(JSON.stringify([T]), { status: 200 })
    }))
    render(<TicketsPanel />)
    await waitFor(() => expect(screen.getByText('Help')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Help'))
    await waitFor(() => expect(screen.getByText('issue')).toBeInTheDocument())
  })
})
