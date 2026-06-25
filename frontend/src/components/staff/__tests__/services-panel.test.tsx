import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ServicesPanel from '../ServicesPanel'

afterEach(() => vi.restoreAllMocks())

describe('ServicesPanel', () => {
  it('lists services and toggles active', async () => {
    const patch = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', vi.fn(async (_url: string, _opts?: RequestInit) => {
      if (_opts?.method === 'PATCH') return patch()
      return new Response(JSON.stringify([{ _id: 's1', key: 'virtual-office', category: 'Office', name: 'Virtual Office', priceCents: 20000, flow: 'generic', active: true }]), { status: 200 })
    }))
    render(<ServicesPanel />)
    await waitFor(() => expect(screen.getByText('Virtual Office')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /disable/i }))
    expect(patch).toHaveBeenCalled()
  })
})
