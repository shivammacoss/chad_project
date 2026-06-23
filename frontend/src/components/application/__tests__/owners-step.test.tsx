import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OwnersStep from '../OwnersStep'
import type { Owner } from '@/types/app'

describe('OwnersStep', () => {
  it('adds an owner and reports the shareholding total', async () => {
    let owners: Owner[] = []
    const onChange = vi.fn((next: Owner[]) => { owners = next })
    const { rerender } = render(<OwnersStep owners={owners} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /add owner/i }))
    expect(onChange).toHaveBeenCalled()
    rerender(<OwnersStep owners={[{ fullName: 'A', role: 'both', nationality: 'IN', ownershipPercent: 100, isPrimaryContact: true }]} onChange={onChange} />)
    expect(screen.getByText(/Shareholding total: 100%/)).toBeInTheDocument()
  })
})
