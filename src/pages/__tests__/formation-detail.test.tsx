import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import FormationDetailPage from '../FormationDetailPage'

afterEach(() => vi.restoreAllMocks())

describe('FormationDetailPage', () => {
  it('shows company name and timeline', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/documents')) return new Response('[]', { status: 200 })
        return new Response(
          JSON.stringify({ _id: 'f1', entityType: 'SARL', companyName: 'Acme SARL', packageTier: 'standard', priceCents: 49900, status: 'in_review', paymentStatus: 'paid', statusHistory: [{ status: 'draft', at: '' }, { status: 'paid', at: '' }], createdAt: '' }),
          { status: 200 },
        )
      }),
    )
    render(
      <MemoryRouter initialEntries={['/formations/f1']}>
        <Routes>
          <Route path="/formations/:id" element={<FormationDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Acme SARL')).toBeInTheDocument())
    expect(screen.getByText('Paid')).toBeInTheDocument()
  })
})
