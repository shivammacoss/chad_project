import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../LoginPage'
import { AuthProvider } from '@/store/AuthContext'

afterEach(() => vi.restoreAllMocks())

function renderLogin() {
  // /me on mount → 401 (anon); login POST → 200
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, opts?: RequestInit) => {
      if (typeof url === 'string' && url.includes('/login') && opts?.method === 'POST') {
        return new Response(JSON.stringify({ id: '1', email: 'a@x.com', fullName: 'A', role: 'user' }), { status: 200 })
      }
      return new Response('{}', { status: 401 })
    }),
  )
  render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('renders the form', () => {
    renderLogin()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('submits credentials', async () => {
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText('Email'), 'a@x.com')
    await userEvent.type(screen.getByPlaceholderText('Password'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))
    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
