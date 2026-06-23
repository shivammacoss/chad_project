import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('test tooling', () => {
  it('renders', () => {
    render(<p>hello chad</p>)
    expect(screen.getByText('hello chad')).toBeInTheDocument()
  })
})
