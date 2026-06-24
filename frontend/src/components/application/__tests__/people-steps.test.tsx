import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShareholdersStep from '../ShareholdersStep'
import DirectorsStep from '../DirectorsStep'
import type { Owner } from '@/types/app'

describe('people steps', () => {
  it('ShareholdersStep adds a shareholder and shows total', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<ShareholdersStep value={[]} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /add shareholder/i }))
    expect(onChange).toHaveBeenCalled()
    rerender(<ShareholdersStep value={[{ fullName: 'A', role: 'shareholder', nationality: 'IN', ownershipPercent: 100, isPrimaryContact: true }] as Owner[]} onChange={onChange} />)
    expect(screen.getByText(/Shareholding total: 100%/)).toBeInTheDocument()
  })
  it('DirectorsStep adds a director with DOB field', async () => {
    const onChange = vi.fn()
    render(<DirectorsStep value={[{ fullName: 'D', role: 'director', nationality: 'Chad', isPrimaryContact: false }] as Owner[]} onChange={onChange} />)
    expect(screen.getByText(/Date of birth/i)).toBeInTheDocument()
  })
})
