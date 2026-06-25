import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/formations/StatusBadge'
import { formatPrice } from '@/content/formations'
import { apiGet, apiDelete } from '@/lib/api'
import { useAuth } from '@/store/AuthContext'
import type { Application } from '@/types/app'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [items, setItems] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    return apiGet<Application[]>('/api/applications').then(setItems).catch(() => setItems([]))
  }
  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  async function remove(id: string) {
    if (!window.confirm('Delete this draft application?')) return
    await apiDelete(`/api/applications/${id}`).catch(() => {})
    load()
  }

  return (
    <div className="min-h-screen bg-navy pt-16">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-4 border-b border-frost/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-frost">Hi {user?.fullName}</h1>
            <p className="mt-1 text-sm text-frost/55">Your company applications in Chad.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/services/new"><Button>Start application</Button></Link>
            <Link to="/invoices"><Button variant="ghost">Invoices</Button></Link>
            <Link to="/support"><Button variant="ghost">Support</Button></Link>
            <Button variant="ghost" onClick={() => logout()}>Log out</Button>
          </div>
        </div>
        {loading ? <p className="mt-10 text-frost/55">Loading…</p>
          : items.length === 0 ? (
            <div className="mt-10 rounded-xl border border-frost/10 bg-steel/20 p-10 text-center">
              <p className="text-frost/70">No applications yet.</p>
              <Link to="/services/new" className="mt-4 inline-block"><Button>Start your first application</Button></Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              {items.map((a) => (
                <div key={a._id}
                  className="flex items-center justify-between rounded-xl border border-frost/10 bg-steel/20 px-6 py-5 transition-colors hover:border-teal-electric/30">
                  <Link to={`/applications/${a._id}`} className="min-w-0 flex-1">
                    <p className="font-medium text-frost">{a.companyDetails?.proposedName || a.serviceName || 'Untitled'}</p>
                    <p className="text-sm text-frost/55">{a.serviceName ?? 'Service'} · {formatPrice(a.priceCents)}{a.status === 'registered' && a.expiresAt ? ` · expires ${new Date(a.expiresAt).toISOString().slice(0, 10)}` : ''}</p>
                  </Link>
                  <div className="ml-4 flex items-center gap-3">
                    <StatusBadge status={a.status} />
                    {a.status === 'draft' && (
                      <button type="button" onClick={() => remove(a._id)} className="text-sm text-indigo-pulse hover:underline">Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}
