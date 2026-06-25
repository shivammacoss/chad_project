import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import InvoicesPage from '../InvoicesPage'

afterEach(() => vi.restoreAllMocks())

describe('InvoicesPage', () => {
  it('lists invoices with a download link', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([
      { _id: 'i1', invoiceNo: 'INV/2026/0001', serviceName: 'Company Formation', amountCents: 49900, currency: 'USD', method: 'stripe', status: 'paid', issuedAt: '' },
    ]), { status: 200 })))
    render(<MemoryRouter><InvoicesPage /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText(/INV\/2026\/0001/)).toBeInTheDocument())
    expect(screen.getByText('Download').closest('a')!.getAttribute('href')).toContain('/api/invoices/i1/pdf')
  })
})
