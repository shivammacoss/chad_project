import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ApplicationDetailPage from '../ApplicationDetailPage'

afterEach(() => vi.restoreAllMocks())

describe('ApplicationDetailPage', () => {
  it('shows company name, owners and timeline', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('/documents')) return new Response('[]', { status: 200 })
      return new Response(JSON.stringify({
        _id: 'a1', entityType: 'SARL', packageTier: 'standard',
        companyDetails: { proposedName: 'Acme SARL', city: "N'Djamena", businessActivity: 'Trading' },
        owners: [{ fullName: 'Alice', role: 'both', nationality: 'IN', ownershipPercent: 100, isPrimaryContact: true }],
        virtualOffice: { wanted: true, plan: 'basic' }, priceCents: 69900, status: 'in_review', paymentStatus: 'paid',
        statusHistory: [{ status: 'draft', at: '' }, { status: 'paid', at: '' }], currentStep: 7, createdAt: '',
      }), { status: 200 })
    }))
    render(<MemoryRouter initialEntries={['/applications/a1']}><Routes><Route path="/applications/:id" element={<ApplicationDetailPage />} /></Routes></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Acme SARL')).toBeInTheDocument())
    expect(screen.getByText('Alice', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Paid')).toBeInTheDocument()
  })
})
