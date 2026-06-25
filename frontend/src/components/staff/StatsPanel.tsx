import { useEffect, useState } from 'react'
import { formatPrice } from '@/content/formations'
import { apiGet } from '@/lib/api'
import type { AdminStats } from '@/types/app'

export default function StatsPanel() {
  const [s, setS] = useState<AdminStats | null>(null)
  useEffect(() => { apiGet<AdminStats>('/api/admin/stats').then(setS).catch(() => {}) }, [])
  if (!s) return null
  const card = (label: string, value: string) => (
    <div className="rounded-xl border border-frost/10 bg-steel/20 px-5 py-4">
      <p className="text-2xl font-semibold text-frost">{value}</p>
      <p className="text-sm text-frost/55">{label}</p>
    </div>
  )
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {card('Applications', String(s.applications.total))}
      {card('Revenue', formatPrice(s.revenueCents))}
      {card('Users', String(s.users))}
      {card('Open tickets', String(s.openTickets))}
    </section>
  )
}
