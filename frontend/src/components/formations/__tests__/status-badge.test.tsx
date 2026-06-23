import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../StatusBadge'
import { formatPrice } from '@/content/formations'

describe('StatusBadge / formatPrice', () => {
  it('renders the human label', () => {
    render(<StatusBadge status="registered" />)
    expect(screen.getByText('Approved')).toBeInTheDocument()
  })
  it('formats price from cents', () => {
    expect(formatPrice(49900)).toBe('$499.00')
  })
})
