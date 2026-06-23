import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminLoginPage from '../AdminLoginPage'
import { AuthProvider } from '@/store/AuthContext'

afterEach(() => vi.restoreAllMocks())

describe('AdminLoginPage', () => {
  it('rejects a non-admin account', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string, opts?: RequestInit) => {
      if (url.includes('/login') && opts?.method === 'POST')
        return new Response(JSON.stringify({ id: '1', email: 'u@x.com', fullName: 'U', role: 'user' }), { status: 200 })
      return new Response('{}', { status: 401 })
    }))
    render(<MemoryRouter><AuthProvider><AdminLoginPage /></AuthProvider></MemoryRouter>)
    await userEvent.type(screen.getByPlaceholderText('Email'), 'u@x.com')
    await userEvent.type(screen.getByPlaceholderText('Password'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText(/not an admin/i)).toBeInTheDocument()
  })
})
