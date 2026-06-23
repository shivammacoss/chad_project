import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import GetStartedPage from '../GetStartedPage'

afterEach(() => vi.restoreAllMocks())

describe('GetStartedPage', () => {
  it('picks an entity then submits signup with phone', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    render(<MemoryRouter><GetStartedPage /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await userEvent.type(screen.getByPlaceholderText('Full name'), 'Jo')
    await userEvent.type(screen.getByPlaceholderText('Email'), 'jo@x.com')
    await userEvent.type(screen.getByPlaceholderText('Country'), 'India')
    await userEvent.type(screen.getByPlaceholderText('Phone'), '+91 99999')
    await userEvent.type(screen.getByPlaceholderText('Password (min 8)'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/signup', expect.objectContaining({ method: 'POST' }))
    expect(await screen.findByText(/check your inbox/i)).toBeInTheDocument()
  })
})
