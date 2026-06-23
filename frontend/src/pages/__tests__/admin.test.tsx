import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminPage from '../AdminPage'

afterEach(() => vi.restoreAllMocks())

describe('AdminPage', () => {
  it('lists formations and patches status', async () => {
    const patch = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, opts?: RequestInit) => {
        if (opts?.method === 'PATCH') return patch()
        return new Response(
          JSON.stringify([
            { _id: 'f1', entityType: 'SARL', companyDetails: { proposedName: 'Acme SARL', city: "N'Djamena" }, owners: [], virtualOffice: { wanted: false }, packageTier: 'standard', priceCents: 49900, status: 'in_review', paymentStatus: 'paid', statusHistory: [], currentStep: 1, createdAt: '', userId: { _id: 'u1', email: 'c@x.com', fullName: 'C' } },
          ]),
          { status: 200 },
        )
      }),
    )
    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Acme SARL')).toBeInTheDocument())
    expect(screen.getByText('c@x.com', { exact: false })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'registered' }))
    expect(patch).toHaveBeenCalled()
  })
})
