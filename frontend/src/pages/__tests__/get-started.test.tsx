import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import GetStartedPage from '../GetStartedPage'

afterEach(() => vi.restoreAllMocks())

describe('GetStartedPage', () => {
  it('lists services then submits signup with phone', async () => {
    const fetchMock = vi.fn(async (url: string, opts?: RequestInit) => {
      if (url.includes('/api/services')) return new Response(JSON.stringify([
        { key: 'company-formation', category: 'Company Formation', name: 'Company Formation', blurb: 'x', priceCents: 49900, flow: 'formation', intakeFields: [], requiredDocuments: [] },
        { key: 'virtual-office', category: 'Office Solutions', name: 'Virtual Office', blurb: 'y', priceCents: 20000, flow: 'generic', intakeFields: [], requiredDocuments: [] },
      ]), { status: 200 })
      if (url.includes('/signup') && opts?.method === 'POST') return new Response('{}', { status: 201 })
      return new Response('{}', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<MemoryRouter><GetStartedPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Virtual Office')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await userEvent.type(screen.getByPlaceholderText('Full name'), 'Jo')
    await userEvent.type(screen.getByPlaceholderText('Email'), 'jo@x.com')
    await userEvent.type(screen.getByPlaceholderText('Country'), 'India')
    await userEvent.type(screen.getByPlaceholderText('Password (min 8)'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/signup', expect.objectContaining({ method: 'POST' }))
    expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument()
  })
})
