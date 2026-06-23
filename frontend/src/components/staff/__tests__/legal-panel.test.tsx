import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LegalPanel from '../LegalPanel'

afterEach(() => vi.restoreAllMocks())

const APP = { _id: 'a1', serviceKey: 'company-formation', serviceName: 'Company Formation', companyDetails: { proposedName: 'Acme SARL', city: '' }, owners: [], virtualOffice: { wanted: false }, priceCents: 49900, status: 'in_review', paymentStatus: 'paid', statusHistory: [], currentStep: 7, createdAt: '', userId: { _id: 'u1', email: 'c@x.com', fullName: 'C' } }

describe('LegalPanel', () => {
  it('lists applications and opens a review with documents', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('/agents')) return new Response('[]', { status: 200 })
      if (url.endsWith('/documents')) return new Response(JSON.stringify([{ _id: 'd1', type: 'passport', fileName: 'p.pdf', status: 'pending', uploadedAt: '' }]), { status: 200 })
      if (url.includes('/api/staff/applications/a1')) return new Response(JSON.stringify(APP), { status: 200 })
      if (url.includes('/api/staff/applications')) return new Response(JSON.stringify([APP]), { status: 200 })
      return new Response('[]', { status: 200 })
    }))
    render(<LegalPanel />)
    await waitFor(() => expect(screen.getByText('Acme SARL')).toBeInTheDocument())
    await userEvent.click(screen.getByText('Acme SARL'))
    await waitFor(() => expect(screen.getByText(/passport/i)).toBeInTheDocument())
  })
})
