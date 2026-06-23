import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import GenericServiceWizardPage from '../GenericServiceWizardPage'

afterEach(() => vi.restoreAllMocks())

describe('GenericServiceWizardPage', () => {
  it('renders intake fields and saves them', async () => {
    const order = { _id: 'o1', serviceKey: 'tax-registration', serviceName: 'Tax Registration', priceCents: 25000, status: 'draft', paymentStatus: 'unpaid', statusHistory: [], currentStep: 1, createdAt: '', owners: [], virtualOffice: { wanted: false }, companyDetails: { city: '' }, intake: {} }
    vi.stubGlobal('fetch', vi.fn(async (url: string, opts?: RequestInit) => {
      if (url.includes('/api/services')) return new Response(JSON.stringify([{ key: 'tax-registration', category: 'Tax & Accounting', name: 'Tax Registration', blurb: 'x', priceCents: 25000, flow: 'generic', intakeFields: [{ name: 'taxType', label: 'Registration type', type: 'select', options: ['VAT'], required: true }], requiredDocuments: ['passport'] }]), { status: 200 })
      if (opts?.method === 'PATCH') return new Response(JSON.stringify({ ...order, intake: { taxType: 'VAT' }, currentStep: 2 }), { status: 200 })
      return new Response(JSON.stringify(order), { status: 200 })
    }))
    render(<MemoryRouter initialEntries={['/services/o1']}><Routes><Route path="/services/:id" element={<GenericServiceWizardPage />} /></Routes></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('Registration type')).toBeInTheDocument())
    await userEvent.selectOptions(screen.getByRole('combobox'), 'VAT')
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))
    await waitFor(() => expect(screen.getByText(/upload documents/i)).toBeInTheDocument())
  })
})
