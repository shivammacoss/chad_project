import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from '../DashboardPage'
import { AuthProvider } from '@/store/AuthContext'

afterEach(() => vi.restoreAllMocks())

describe('DashboardPage', () => {
  it('lists the user formations', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/api/auth/me')) {
          return new Response(JSON.stringify({ id: '1', email: 'a@x.com', fullName: 'Jo', role: 'user' }), { status: 200 })
        }
        if (url.includes('/api/formations')) {
          return new Response(
            JSON.stringify([
              { _id: 'f1', entityType: 'SARL', companyName: 'Acme SARL', packageTier: 'standard', priceCents: 49900, status: 'registered', paymentStatus: 'paid', statusHistory: [], createdAt: '' },
            ]),
            { status: 200 },
          )
        }
        return new Response('[]', { status: 200 })
      }),
    )
    render(
      <MemoryRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Acme SARL')).toBeInTheDocument())
    expect(screen.getByText('Registered')).toBeInTheDocument()
  })
})
