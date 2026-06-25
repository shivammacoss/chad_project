import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SupportPage from '../SupportPage'

afterEach(() => vi.restoreAllMocks())

describe('SupportPage', () => {
  it('lists tickets and opens a thread', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: string, opts?: RequestInit) => {
      if (opts?.method === 'POST') return new Response(JSON.stringify({ _id: 't1', category: 'other', subject: 'New', status: 'open', messages: [{ authorRole: 'customer', body: 'hi', at: '' }], updatedAt: '' }), { status: 201 })
      return new Response(JSON.stringify([{ _id: 't1', category: 'documents', subject: 'Help', status: 'open', messages: [{ authorRole: 'customer', body: 'issue', at: '' }], updatedAt: '' }]), { status: 200 })
    }))
    render(<MemoryRouter><SupportPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Help')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Help'))
    expect(screen.getByText('issue')).toBeInTheDocument()
  })
})
