import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminPage from '../AdminPage'

afterEach(() => vi.restoreAllMocks())

const APP = {
  _id: 'a1', entityType: 'SARL', packageTier: 'standard',
  companyDetails: { proposedName: 'Acme SARL', city: "N'Djamena" },
  owners: [{ fullName: 'Alice', role: 'both', nationality: 'IN', ownershipPercent: 100, isPrimaryContact: true }],
  virtualOffice: { wanted: false }, priceCents: 49900, status: 'in_review', paymentStatus: 'paid',
  statusHistory: [], currentStep: 7, createdAt: '', userId: { _id: 'u1', email: 'c@x.com', fullName: 'C' },
}

describe('AdminPage', () => {
  it('lists, opens an application, and advances status', async () => {
    const patch = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', vi.fn(async (url: string, opts?: RequestInit) => {
      if (opts?.method === 'PATCH') return patch()
      if (url.endsWith('/documents')) return new Response('[]', { status: 200 })
      if (url.includes('/api/admin/applications/a1')) return new Response(JSON.stringify(APP), { status: 200 })
      if (url.includes('/api/admin/applications')) return new Response(JSON.stringify([APP]), { status: 200 })
      return new Response('[]', { status: 200 })
    }))
    render(<MemoryRouter><AdminPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Acme SARL')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Acme SARL'))
    await waitFor(() => expect(screen.getByText('Alice', { exact: false })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'registered' }))
    expect(patch).toHaveBeenCalled()
  })
})
