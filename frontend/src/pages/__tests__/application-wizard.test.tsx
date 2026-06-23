import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ApplicationWizardPage from '../ApplicationWizardPage'

afterEach(() => vi.restoreAllMocks())

describe('ApplicationWizardPage', () => {
  it('creates an application and advances to company details', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      _id: 'a1', entityType: 'SARL', packageTier: 'standard', companyDetails: { proposedName: '', city: "N'Djamena" }, owners: [], virtualOffice: { wanted: false }, priceCents: 49900, status: 'draft', paymentStatus: 'unpaid', statusHistory: [], currentStep: 1, createdAt: '',
    }), { status: 201 })))
    render(<MemoryRouter><ApplicationWizardPage /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: /^continue$/i }))
    expect(await screen.findByText(/company details/i)).toBeInTheDocument()
  })
})
