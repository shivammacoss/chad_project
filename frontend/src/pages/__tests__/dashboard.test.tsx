import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from '../DashboardPage'
import { AuthProvider } from '@/store/AuthContext'

afterEach(() => vi.restoreAllMocks())

describe('DashboardPage', () => {
  it('lists the user applications', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('/api/auth/me')) return new Response(JSON.stringify({ id: '1', email: 'a@x.com', fullName: 'Jo', role: 'user' }), { status: 200 })
      if (url.includes('/api/applications')) return new Response(JSON.stringify([
        { _id: 'a1', entityType: 'SARL', packageTier: 'standard', companyDetails: { proposedName: 'Acme SARL', city: "N'Djamena" }, owners: [], virtualOffice: { wanted: false }, priceCents: 49900, status: 'registered', paymentStatus: 'paid', statusHistory: [], currentStep: 7, createdAt: '' },
      ]), { status: 200 })
      return new Response('[]', { status: 200 })
    }))
    render(<MemoryRouter><AuthProvider><DashboardPage /></AuthProvider></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Acme SARL')).toBeInTheDocument())
    expect(screen.getByText('Approved')).toBeInTheDocument()
  })
})
