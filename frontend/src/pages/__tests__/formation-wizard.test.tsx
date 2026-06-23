import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import FormationWizardPage from '../FormationWizardPage'

afterEach(() => vi.restoreAllMocks())

describe('FormationWizardPage', () => {
  it('creates a formation and advances to upload step', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ _id: 'f1', entityType: 'SARL', companyName: 'Acme', packageTier: 'standard', priceCents: 49900, status: 'draft', paymentStatus: 'unpaid', statusHistory: [], createdAt: '' }), { status: 201 }),
      ),
    )
    render(
      <MemoryRouter>
        <FormationWizardPage />
      </MemoryRouter>,
    )
    await userEvent.type(screen.getByPlaceholderText('Proposed company name'), 'Acme')
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    expect(await screen.findByText(/upload your documents/i)).toBeInTheDocument()
  })
})
